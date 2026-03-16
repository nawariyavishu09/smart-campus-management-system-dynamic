from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import random
import re
import smtplib
import socket
import ssl
import requests
from email.message import EmailMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'smartcampus_jwt_secret_2024_xK9mP2vL8qR3')
JWT_ALGORITHM = 'HS256'
SMTP_HOST = os.environ.get('SMTP_HOST', '').strip()
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587') or 587)
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '').strip()
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '').strip()
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', SMTP_USERNAME).strip()
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'Smart Campus').strip()
SMTP_USE_TLS = os.environ.get('SMTP_USE_TLS', 'true').strip().lower() not in {'0', 'false', 'no'}
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
RESEND_FROM_EMAIL = os.environ.get('RESEND_FROM_EMAIL', SMTP_FROM_EMAIL).strip()
LOGIN_URL = os.environ.get('LOGIN_URL', os.environ.get('FRONTEND_URL', 'http://localhost:3000').rstrip('/') + '/login').strip()

app = FastAPI(title="Smart Campus Management System API")

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health Check (required by Railway/Render) ---
@app.get("/")
async def health_check():
    return {"status": "ok", "service": "Smart Campus API"}

api_router = APIRouter(prefix="/api")
security = HTTPBearer()
logger = logging.getLogger(__name__)

# ─── Auth Helpers ───────────────────────────────────────────────────────────────

def hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_pw(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str, name: str, email: str) -> str:
    payload = {
        'user_id': user_id, 'role': role, 'name': name, 'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0, 'password_hash': 0})
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

async def find_department_record(department_value: str):
    if not department_value:
        return None
    val = department_value.strip()
    if not val:
        return None

    return await db.departments.find_one(
        {
            '$or': [
                {'id': val},
                {'code': {'$regex': f'^{re.escape(val)}$', '$options': 'i'}},
                {'name': {'$regex': f'^{re.escape(val)}$', '$options': 'i'}},
            ]
        },
        {'_id': 0}
    )

async def generate_unique_enrollment_number(department_id: str = "") -> str:
    dept_code = 'GEN'
    if department_id:
        dept = await db.departments.find_one({'id': department_id}, {'_id': 0, 'code': 1})
        if dept and dept.get('code'):
            dept_code = re.sub(r'[^A-Z0-9]', '', dept['code'].upper())[:4] or 'GEN'

    while True:
        candidate = f"EN{datetime.now(timezone.utc).year}{dept_code}{random.randint(10000, 99999)}"
        exists = await db.students.find_one({'enrollment_number': candidate}, {'_id': 1})
        if not exists:
            return candidate

def send_account_credentials_email(recipient_email: str, full_name: str, password: str) -> tuple[bool, str]:
    if not SMTP_HOST or not SMTP_USERNAME or not SMTP_PASSWORD or not SMTP_FROM_EMAIL:
        logger.warning('SMTP not fully configured for %s; attempting Resend fallback', recipient_email)
        if RESEND_API_KEY and RESEND_FROM_EMAIL:
            return send_account_credentials_email_via_resend(recipient_email, full_name, password)
        return False, 'SMTP is not configured'

    message = EmailMessage()
    message['Subject'] = 'Your Smart Campus Student Account Is Approved'
    message['From'] = f'{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>' if SMTP_FROM_NAME else SMTP_FROM_EMAIL
    message['To'] = recipient_email
    message.set_content(
        f"""Hello {full_name},

Your student account request has been approved by the Smart Campus administration team.

You can now log in using the following credentials:

Email: {recipient_email}
Password: {password}
Login URL: {LOGIN_URL}

For security, please log in and change your password after your first login.

Regards,
{SMTP_FROM_NAME}
"""
    )

    # Render/container environments may resolve SMTP hosts to IPv6 first.
    # If IPv6 routing is unavailable, retrying with IPv4 avoids "Network is unreachable" failures.
    try:
        addr_infos = socket.getaddrinfo(SMTP_HOST, SMTP_PORT, type=socket.SOCK_STREAM)
    except Exception as exc:
        logger.exception('Failed to resolve SMTP host %s', SMTP_HOST)
        return False, f'Failed to resolve SMTP host: {exc}'

    endpoints: list[tuple[str, int, int]] = []
    seen = set()
    for family in (socket.AF_INET, socket.AF_INET6):
        for info in addr_infos:
            fam, _, _, _, sockaddr = info
            if fam != family:
                continue
            host = sockaddr[0]
            port = int(sockaddr[1])
            key = (host, port, fam)
            if key in seen:
                continue
            seen.add(key)
            endpoints.append((host, port, fam))

    if not endpoints:
        return False, 'No reachable SMTP endpoints resolved'

    last_error = ''
    for endpoint_host, endpoint_port, family in endpoints:
        try:
            if SMTP_USE_TLS:
                with smtplib.SMTP(endpoint_host, endpoint_port, timeout=20) as server:
                    server.ehlo()
                    server.starttls(context=ssl.create_default_context())
                    server.ehlo()
                    server.login(SMTP_USERNAME, SMTP_PASSWORD)
                    server.send_message(message)
            else:
                with smtplib.SMTP_SSL(endpoint_host, endpoint_port, timeout=20, context=ssl.create_default_context()) as server:
                    server.login(SMTP_USERNAME, SMTP_PASSWORD)
                    server.send_message(message)
            return True, ''
        except Exception as exc:
            family_name = 'IPv4' if family == socket.AF_INET else 'IPv6'
            last_error = f'{family_name} {endpoint_host}:{endpoint_port} -> {exc}'
            logger.warning('SMTP attempt failed for %s via %s', recipient_email, last_error)

    logger.error('All SMTP connection attempts failed for %s: %s', recipient_email, last_error)
    if RESEND_API_KEY and RESEND_FROM_EMAIL:
        resend_ok, resend_error = send_account_credentials_email_via_resend(recipient_email, full_name, password)
        if resend_ok:
            return True, ''
        return False, f'SMTP failed: {last_error}; Resend failed: {resend_error}'

    return False, last_error

def send_account_credentials_email_via_resend(recipient_email: str, full_name: str, password: str) -> tuple[bool, str]:
    if not RESEND_API_KEY or not RESEND_FROM_EMAIL:
        return False, 'Resend is not configured'

    subject = 'Your Smart Campus Student Account Is Approved'
    text_body = (
        f"Hello {full_name},\n\n"
        "Your student account request has been approved by the Smart Campus administration team.\n\n"
        "You can now log in using the following credentials:\n\n"
        f"Email: {recipient_email}\n"
        f"Password: {password}\n"
        f"Login URL: {LOGIN_URL}\n\n"
        "For security, please log in and change your password after your first login.\n\n"
        f"Regards,\n{SMTP_FROM_NAME}"
    )

    try:
        response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {RESEND_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'from': f'{SMTP_FROM_NAME} <{RESEND_FROM_EMAIL}>' if SMTP_FROM_NAME else RESEND_FROM_EMAIL,
                'to': [recipient_email],
                'subject': subject,
                'text': text_body,
            },
            timeout=20,
        )

        if 200 <= response.status_code < 300:
            return True, ''

        return False, f'Resend HTTP {response.status_code}: {response.text}'
    except Exception as exc:
        logger.exception('Failed to send approval email via Resend to %s', recipient_email)
        return False, str(exc)

async def get_student_profile_by_user(user_id: str):
    student = await db.students.find_one({'user_id': user_id}, {'_id': 0})
    if not student:
        return None

    updates = {}
    if not student.get('enrollment_number'):
        updates['enrollment_number'] = await generate_unique_enrollment_number(student.get('department_id', ''))

    if not student.get('department_id'):
        linked_user = await db.users.find_one({'id': user_id}, {'_id': 0, 'department_id': 1, 'department': 1})
        resolved_department_id = (linked_user or {}).get('department_id') or await resolve_department_id((linked_user or {}).get('department', ''))
        if resolved_department_id:
            updates['department_id'] = resolved_department_id

    if updates:
        await db.students.update_one({'id': student['id']}, {'$set': updates})
        student.update(updates)

    return student

async def get_faculty_profile_by_user(user_id: str):
    return await db.faculty.find_one({'user_id': user_id}, {'_id': 0})

async def resolve_department_id(department_value: str) -> str:
    dept = await find_department_record(department_value)
    return dept['id'] if dept else ""

# ─── Pydantic Models ───────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class StudentCreate(BaseModel):
    full_name: str
    roll_number: str
    enrollment_number: str = ""
    email: str
    phone: str = ""
    gender: str = "Male"
    date_of_birth: str = ""
    address: str = ""
    department_id: str = ""
    semester: int = 1
    section: str = "A"
    admission_date: str = ""
    status: str = "active"

class FacultyCreate(BaseModel):
    name: str
    faculty_id_number: str
    department_id: str = ""
    designation: str = ""
    email: str
    phone: str = ""

class DepartmentCreate(BaseModel):
    name: str
    code: str
    head_faculty_id: str = ""
    description: str = ""

class SubjectCreate(BaseModel):
    name: str
    code: str
    department_id: str = ""
    semester: int = 1
    credits: int = 3

class AttendanceBulkCreate(BaseModel):
    subject_id: str
    date: str
    records: List[dict]

class MarksCreate(BaseModel):
    student_id: str
    subject_id: str
    internal_marks: float = 0
    practical_marks: float = 0
    final_marks: float = 0

class NoticeCreate(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    audience: str = "all"

class ComplaintCreate(BaseModel):
    title: str
    description: str

class ComplaintUpdate(BaseModel):
    status: str
    remarks: str = ""

class SupportMessageCreate(BaseModel):
    message: str

class SupportMessageReply(BaseModel):
    status: str = "resolved"
    admin_reply: str = ""

class SignupRequestCreate(BaseModel):
    full_name: str
    email: str
    phone: str = ""
    role: str = "student"          # student | faculty
    department: str = ""
    department_id: str = ""
    roll_number: str = ""          # for students
    semester: int = 1              # for students
    date_of_birth: str = ""
    address: str = ""
    employee_id: str = ""          # for faculty
    designation: str = ""          # for faculty
    id_image_base64: str = ""      # college ID photo (base64)

class SignupRequestAction(BaseModel):
    action: str                    # "approve" | "reject"
    remarks: str = ""

def calc_grade(pct):
    if pct >= 90: return 'A+'
    if pct >= 80: return 'A'
    if pct >= 70: return 'B+'
    if pct >= 60: return 'B'
    if pct >= 50: return 'C'
    if pct >= 40: return 'D'
    return 'F'

# ─── AUTH ROUTES ────────────────────────────────────────────────────────────────

@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({'email': req.email}, {'_id': 0})
    if not user or not verify_pw(req.password, user['password_hash']):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    token = create_token(user['id'], user['role'], user['name'], user['email'])
    return {
        'token': token,
        'user': {'id': user['id'], 'email': user['email'], 'name': user['name'], 'role': user['role']}
    }

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user

# ─── STUDENT ROUTES ─────────────────────────────────────────────────────────────

@api_router.get("/students")
async def get_students(user=Depends(get_current_user), search: str = "", department_id: str = "", semester: int = 0, status: str = "", page: int = 1, limit: int = 50):
    if user['role'] == 'student':
        student = await get_student_profile_by_user(user['id'])
        if not student:
            return {'students': [], 'total': 0, 'page': 1, 'pages': 1}

        if search:
            q = search.lower().strip()
            haystack = f"{student.get('full_name', '')} {student.get('roll_number', '')} {student.get('email', '')}".lower()
            if q not in haystack:
                return {'students': [], 'total': 0, 'page': 1, 'pages': 1}

        return {'students': [student], 'total': 1, 'page': 1, 'pages': 1}

    if user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            return {'students': [], 'total': 0, 'page': 1, 'pages': 1}
        department_id = faculty.get('department_id', '')

    query = {}
    if search:
        query['$or'] = [
            {'full_name': {'$regex': search, '$options': 'i'}},
            {'roll_number': {'$regex': search, '$options': 'i'}},
            {'email': {'$regex': search, '$options': 'i'}}
        ]
    if department_id: query['department_id'] = department_id
    if semester > 0: query['semester'] = semester
    if status: query['status'] = status
    
    total = await db.students.count_documents(query)
    students = await db.students.find(query, {'_id': 0}).skip((page - 1) * limit).limit(limit).to_list(limit)
    return {'students': students, 'total': total, 'page': page, 'pages': max(1, (total + limit - 1) // limit)}

@api_router.get("/students/{student_id}")
async def get_student(student_id: str, user=Depends(get_current_user)):
    if user['role'] == 'student':
        own_student = await get_student_profile_by_user(user['id'])
        if not own_student:
            raise HTTPException(status_code=404, detail='Student profile not found')
        if student_id != own_student['id']:
            raise HTTPException(status_code=403, detail='Not authorized to view other students')

    if user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            raise HTTPException(status_code=404, detail='Faculty profile not found')

    student = await db.students.find_one({'id': student_id}, {'_id': 0})
    if not student:
        raise HTTPException(status_code=404, detail='Student not found')
    if user['role'] == 'faculty' and student.get('department_id') != faculty.get('department_id'):
        raise HTTPException(status_code=403, detail='Not authorized to view other departments students')
    return student

@api_router.post("/students")
async def create_student(data: StudentCreate, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    student_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    payload = data.model_dump()
    if not payload.get('enrollment_number'):
        payload['enrollment_number'] = await generate_unique_enrollment_number(payload.get('department_id', ''))
    if not payload.get('admission_date'):
        payload['admission_date'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    await db.users.insert_one({
        'id': user_id, 'email': data.email,
        'password_hash': hash_pw('student123'),
        'name': data.full_name, 'role': 'student', 'department_id': payload.get('department_id', '')
    })
    
    student = {'id': student_id, 'user_id': user_id, **payload, 'created_at': datetime.now(timezone.utc).isoformat()}
    await db.students.insert_one(student)
    student.pop('_id', None)
    return student

@api_router.put("/students/{student_id}")
async def update_student(student_id: str, data: StudentCreate, user=Depends(get_current_user)):
    if user['role'] not in ['admin', 'faculty']:
        raise HTTPException(status_code=403, detail='Not authorized')

    if user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            raise HTTPException(status_code=404, detail='Faculty profile not found')
        existing_student = await db.students.find_one({'id': student_id}, {'_id': 0})
        if not existing_student:
            raise HTTPException(status_code=404, detail='Student not found')
        if existing_student.get('department_id') != faculty.get('department_id'):
            raise HTTPException(status_code=403, detail='Not authorized to update other departments students')
        if data.department_id != faculty.get('department_id'):
            raise HTTPException(status_code=403, detail='Faculty cannot move student to another department')
    
    payload = data.model_dump()
    existing_before_update = await db.students.find_one({'id': student_id}, {'_id': 0})
    if not existing_before_update:
        raise HTTPException(status_code=404, detail='Student not found')
    if not payload.get('enrollment_number'):
        payload['enrollment_number'] = existing_before_update.get('enrollment_number') or await generate_unique_enrollment_number(payload.get('department_id', existing_before_update.get('department_id', '')))
    result = await db.students.update_one({'id': student_id}, {'$set': payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Student not found')
        
    updated = await db.students.find_one({'id': student_id}, {'_id': 0})
    if updated.get('user_id'):
        await db.users.update_one({'id': updated.get('user_id')}, {'$set': {'name': data.full_name, 'email': data.email, 'department_id': updated.get('department_id', '')}})
    return updated

@api_router.delete("/students/{student_id}")
async def delete_student(student_id: str, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
        
    student = await db.students.find_one({'id': student_id}, {'_id': 0})
    if not student:
        raise HTTPException(status_code=404, detail='Student not found')
        
    await db.students.delete_one({'id': student_id})
    if student.get('user_id'):
        await db.users.delete_one({'id': student['user_id']})
        
    await db.attendance.delete_many({'student_id': student_id})
    await db.marks.delete_many({'student_id': student_id})
    return {'message': 'Student deleted successfully'}

# ─── FACULTY ROUTES ─────────────────────────────────────────────────────────────

@api_router.get("/faculty")
async def get_faculty_list(user=Depends(get_current_user), search: str = "", department_id: str = ""):
    if user['role'] == 'faculty':
        own_faculty = await get_faculty_profile_by_user(user['id'])
        if not own_faculty:
            return {'faculty': []}
        if search:
            q = search.lower().strip()
            haystack = f"{own_faculty.get('name', '')} {own_faculty.get('email', '')} {own_faculty.get('faculty_id_number', '')}".lower()
            if q not in haystack:
                return {'faculty': []}
        return {'faculty': [own_faculty]}

    query = {}
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'email': {'$regex': search, '$options': 'i'}},
            {'faculty_id_number': {'$regex': search, '$options': 'i'}}
        ]
    if department_id:
        query['department_id'] = department_id
    faculty = await db.faculty.find(query, {'_id': 0}).to_list(100)
    return {'faculty': faculty}

@api_router.post("/faculty")
async def create_faculty(data: FacultyCreate, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    fac_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    
    await db.users.insert_one({
        'id': user_id, 'email': data.email,
        'password_hash': hash_pw('faculty123'),
        'name': data.name, 'role': 'faculty'
    })
    
    fac = {'id': fac_id, 'user_id': user_id, **data.model_dump(), 'created_at': datetime.now(timezone.utc).isoformat()}
    await db.faculty.insert_one(fac)
    fac.pop('_id', None)
    return fac

@api_router.put("/faculty/{faculty_id}")
async def update_faculty(faculty_id: str, data: FacultyCreate, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    
    result = await db.faculty.update_one({'id': faculty_id}, {'$set': data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Faculty not found')
    fac = await db.faculty.find_one({'id': faculty_id}, {'_id': 0})
    return fac

@api_router.delete("/faculty/{faculty_id}")
async def delete_faculty(faculty_id: str, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
        
    fac = await db.faculty.find_one({'id': faculty_id}, {'_id': 0})
    if not fac:
        raise HTTPException(status_code=404, detail='Faculty not found')
        
    await db.faculty.delete_one({'id': faculty_id})
    if fac.get('user_id'):
        await db.users.delete_one({'id': fac['user_id']})
    return {'message': 'Faculty deleted successfully'}

# ─── DEPARTMENT ROUTES ──────────────────────────────────────────────────────────

@api_router.get("/departments")
async def get_departments(user=Depends(get_current_user)):
    depts = await db.departments.find({}, {'_id': 0}).to_list(50)
    return {'departments': depts}

@api_router.get("/public/departments")
async def get_public_departments():
    depts = await db.departments.find({}, {'_id': 0}).to_list(100)
    return {'departments': depts}

@api_router.post("/departments")
async def create_department(data: DepartmentCreate, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    dept = {'id': str(uuid.uuid4()), **data.model_dump(), 'created_at': datetime.now(timezone.utc).isoformat()}
    await db.departments.insert_one(dept)
    dept.pop('_id', None)
    return dept

@api_router.put("/departments/{dept_id}")
async def update_department(dept_id: str, data: DepartmentCreate, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    await db.departments.update_one({'id': dept_id}, {'$set': data.model_dump()})
    dept = await db.departments.find_one({'id': dept_id}, {'_id': 0})
    if not dept:
        raise HTTPException(status_code=404, detail='Department not found')
    return dept

@api_router.delete("/departments/{dept_id}")
async def delete_department(dept_id: str, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    await db.departments.delete_one({'id': dept_id})
    return {'message': 'Department deleted'}

# ─── SUBJECT ROUTES ─────────────────────────────────────────────────────────────

@api_router.get("/subjects")
async def get_subjects(user=Depends(get_current_user), department_id: str = "", semester: int = 0):
    query = {}
    if user['role'] == 'student':
        student = await get_student_profile_by_user(user['id'])
        if not student:
            return {'subjects': []}
        query['department_id'] = student.get('department_id', '')
        query['semester'] = student.get('semester', 0)
    elif user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            return {'subjects': []}
        query['department_id'] = faculty.get('department_id', '')
        if semester > 0:
            query['semester'] = semester
    else:
        if department_id:
            query['department_id'] = department_id
        if semester > 0:
            query['semester'] = semester
    subjects = await db.subjects.find(query, {'_id': 0}).to_list(100)
    return {'subjects': subjects}

@api_router.post("/subjects")
async def create_subject(data: SubjectCreate, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    subj = {'id': str(uuid.uuid4()), **data.model_dump(), 'created_at': datetime.now(timezone.utc).isoformat()}
    await db.subjects.insert_one(subj)
    subj.pop('_id', None)
    return subj

@api_router.put("/subjects/{subject_id}")
async def update_subject(subject_id: str, data: SubjectCreate, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    await db.subjects.update_one({'id': subject_id}, {'$set': data.model_dump()})
    subj = await db.subjects.find_one({'id': subject_id}, {'_id': 0})
    return subj

@api_router.delete("/subjects/{subject_id}")
async def delete_subject(subject_id: str, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
    await db.subjects.delete_one({'id': subject_id})
    return {'message': 'Subject deleted'}

# ─── ATTENDANCE ROUTES ──────────────────────────────────────────────────────────

@api_router.get("/attendance")
async def get_attendance(user=Depends(get_current_user), student_id: str = "", subject_id: str = "", date_val: str = Query("", alias="date"), page: int = 1, limit: int = 100):
    query = {}
    if user['role'] == 'student':
        student = await get_student_profile_by_user(user['id'])
        if student: query['student_id'] = student['id']
    elif user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            return {'attendance': [], 'total': 0}

        dept_student_docs = await db.students.find({'department_id': faculty.get('department_id', '')}, {'_id': 0, 'id': 1}).to_list(2000)
        dept_student_ids = [s['id'] for s in dept_student_docs]

        if student_id:
            if student_id not in dept_student_ids:
                raise HTTPException(status_code=403, detail='Not authorized to view other departments attendance')
            query['student_id'] = student_id
        else:
            query['student_id'] = {'$in': dept_student_ids} if dept_student_ids else '__none__'

        if subject_id:
            subject = await db.subjects.find_one({'id': subject_id}, {'_id': 0})
            if not subject:
                raise HTTPException(status_code=404, detail='Subject not found')
            if subject.get('department_id') != faculty.get('department_id'):
                raise HTTPException(status_code=403, detail='Not authorized to view other departments subjects')
    elif student_id:
        query['student_id'] = student_id
        
    if subject_id: query['subject_id'] = subject_id
    if date_val: query['date'] = date_val
    
    total = await db.attendance.count_documents(query)
    records = await db.attendance.find(query, {'_id': 0}).sort('date', -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return {'attendance': records, 'total': total}

@api_router.post("/attendance/bulk")
async def bulk_attendance(data: AttendanceBulkCreate, user=Depends(get_current_user)):
    if user['role'] not in ['admin', 'faculty']:
        raise HTTPException(status_code=403, detail='Not authorized')

    if user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            raise HTTPException(status_code=404, detail='Faculty profile not found')

        subject = await db.subjects.find_one({'id': data.subject_id}, {'_id': 0})
        if not subject:
            raise HTTPException(status_code=404, detail='Subject not found')
        if subject.get('department_id') != faculty.get('department_id'):
            raise HTTPException(status_code=403, detail='Not authorized for this subject')

        student_ids = [r.get('student_id') for r in data.records]
        unique_ids = list({sid for sid in student_ids if sid})
        if unique_ids:
            allowed_count = await db.students.count_documents({'id': {'$in': unique_ids}, 'department_id': faculty.get('department_id', '')})
            if allowed_count != len(unique_ids):
                raise HTTPException(status_code=403, detail='Not authorized to mark other departments students')
        
    records = []
    for r in data.records:
        records.append({
            'id': str(uuid.uuid4()), 'student_id': r['student_id'],
            'subject_id': data.subject_id, 'date': data.date,
            'status': r['status'], 'marked_by': user['id'],
            'created_at': datetime.now(timezone.utc).isoformat()
        })
        
    if records:
        await db.attendance.delete_many({'date': data.date, 'subject_id': data.subject_id})
        await db.attendance.insert_many(records)
        
    return {'message': f'{len(records)} attendance records saved', 'count': len(records)}

@api_router.get("/attendance/summary/{student_id}")
async def attendance_summary(student_id: str, user=Depends(get_current_user)):
    if user['role'] == 'student':
        own_student = await get_student_profile_by_user(user['id'])
        if not own_student:
            raise HTTPException(status_code=404, detail='Student profile not found')
        if student_id != own_student['id']:
            raise HTTPException(status_code=403, detail='Not authorized to view other students attendance')
    elif user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            raise HTTPException(status_code=404, detail='Faculty profile not found')
        target_student = await db.students.find_one({'id': student_id}, {'_id': 0})
        if not target_student:
            raise HTTPException(status_code=404, detail='Student not found')
        if target_student.get('department_id') != faculty.get('department_id'):
            raise HTTPException(status_code=403, detail='Not authorized to view other departments attendance')

    pipeline = [
        {'$match': {'student_id': student_id}},
        {'$group': {
            '_id': '$subject_id',
            'total': {'$sum': 1},
            'present': {'$sum': {'$cond': [{'$eq': ['$status', 'present']}, 1, 0]}},
            'absent': {'$sum': {'$cond': [{'$eq': ['$status', 'absent']}, 1, 0]}},
            'late': {'$sum': {'$cond': [{'$eq': ['$status', 'late']}, 1, 0]}}
        }}
    ]
    results = await db.attendance.aggregate(pipeline).to_list(50)
    subjects = {s['id']: s['name'] for s in await db.subjects.find({}, {'_id': 0}).to_list(100)}
    
    summary = []
    for r in results:
        total = r['total']
        percentage = round((r['present'] + r['late']) / total * 100, 1) if total > 0 else 0
        summary.append({
            'subject_id': r['_id'], 'subject_name': subjects.get(r['_id'], 'Unknown'),
            'total': total, 'present': r['present'], 'absent': r['absent'], 'late': r['late'],
            'percentage': percentage
        })
    return {'summary': summary}

# ─── MARKS ROUTES ───────────────────────────────────────────────────────────────

@api_router.get("/marks")
async def get_marks(user=Depends(get_current_user), student_id: str = "", subject_id: str = ""):
    query = {}
    if user['role'] == 'student':
        student = await get_student_profile_by_user(user['id'])
        if student: query['student_id'] = student['id']
    elif user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            return {'marks': []}

        dept_student_docs = await db.students.find({'department_id': faculty.get('department_id', '')}, {'_id': 0, 'id': 1}).to_list(2000)
        dept_student_ids = [s['id'] for s in dept_student_docs]

        if student_id:
            if student_id not in dept_student_ids:
                raise HTTPException(status_code=403, detail='Not authorized to view other departments marks')
            query['student_id'] = student_id
        else:
            query['student_id'] = {'$in': dept_student_ids} if dept_student_ids else '__none__'

        if subject_id:
            subject = await db.subjects.find_one({'id': subject_id}, {'_id': 0})
            if not subject:
                raise HTTPException(status_code=404, detail='Subject not found')
            if subject.get('department_id') != faculty.get('department_id'):
                raise HTTPException(status_code=403, detail='Not authorized to view other departments subjects')
    elif student_id:
        query['student_id'] = student_id
        
    if subject_id: query['subject_id'] = subject_id
    marks = await db.marks.find(query, {'_id': 0}).to_list(500)
    return {'marks': marks}

@api_router.post("/marks")
async def create_marks(data: MarksCreate, user=Depends(get_current_user)):
    if user['role'] not in ['admin', 'faculty']:
        raise HTTPException(status_code=403, detail='Not authorized')

    if user['role'] == 'faculty':
        faculty = await get_faculty_profile_by_user(user['id'])
        if not faculty:
            raise HTTPException(status_code=404, detail='Faculty profile not found')

        subject = await db.subjects.find_one({'id': data.subject_id}, {'_id': 0})
        if not subject:
            raise HTTPException(status_code=404, detail='Subject not found')
        if subject.get('department_id') != faculty.get('department_id'):
            raise HTTPException(status_code=403, detail='Not authorized for this subject')

        student = await db.students.find_one({'id': data.student_id}, {'_id': 0})
        if not student:
            raise HTTPException(status_code=404, detail='Student not found')
        if student.get('department_id') != faculty.get('department_id'):
            raise HTTPException(status_code=403, detail='Not authorized for this student')
        
    total = data.internal_marks + data.practical_marks + data.final_marks
    percentage = round(total, 1)
    grade = calc_grade(percentage)
    result_status = 'Pass' if percentage >= 40 else 'Fail'
    
    mark_data = {
        **data.model_dump(), 'total': total, 'percentage': percentage,
        'grade': grade, 'result_status': result_status, 'entered_by': user['id']
    }
    
    existing = await db.marks.find_one({'student_id': data.student_id, 'subject_id': data.subject_id})
    if existing:
        await db.marks.update_one(
            {'student_id': data.student_id, 'subject_id': data.subject_id},
            {'$set': mark_data}
        )
    else:
        mark_data['id'] = str(uuid.uuid4())
        mark_data['created_at'] = datetime.now(timezone.utc).isoformat()
        await db.marks.insert_one(mark_data)
        
    result = await db.marks.find_one({'student_id': data.student_id, 'subject_id': data.subject_id}, {'_id': 0})
    return result

# ─── NOTICE ROUTES ──────────────────────────────────────────────────────────────

@api_router.get("/notices")
async def get_notices(user=Depends(get_current_user)):
    query = {}
    if user['role'] == 'student':
        query['$or'] = [{'audience': 'all'}, {'audience': 'students'}]
    elif user['role'] == 'faculty':
        query['$or'] = [{'audience': 'all'}, {'audience': 'faculty'}]
        
    notices = await db.notices.find(query, {'_id': 0}).sort('created_at', -1).to_list(100)
    return {'notices': notices}

@api_router.post("/notices")
async def create_notice(data: NoticeCreate, user=Depends(get_current_user)):
    if user['role'] not in ['admin', 'faculty']:
        raise HTTPException(status_code=403, detail='Not authorized')
        
    notice = {
        'id': str(uuid.uuid4()), **data.model_dump(),
        'posted_by': user['name'], 'posted_by_id': user['id'],
        'date': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.notices.insert_one(notice)
    notice.pop('_id', None)
    return notice

@api_router.delete("/notices/{notice_id}")
async def delete_notice(notice_id: str, user=Depends(get_current_user)):
    if user['role'] not in ['admin', 'faculty']:
        raise HTTPException(status_code=403, detail='Not authorized')
    await db.notices.delete_one({'id': notice_id})
    return {'message': 'Notice deleted'}

# ─── COMPLAINT ROUTES ───────────────────────────────────────────────────────────

@api_router.get("/complaints")
async def get_complaints(user=Depends(get_current_user), status_filter: str = Query("", alias="status")):
    query = {}
    if user['role'] == 'student':
        student = await get_student_profile_by_user(user['id'])
        if student: query['student_id'] = student['id']
        
    if status_filter: query['status'] = status_filter
    complaints = await db.complaints.find(query, {'_id': 0}).sort('created_at', -1).to_list(100)
    return {'complaints': complaints}

@api_router.post("/complaints")
async def create_complaint(data: ComplaintCreate, user=Depends(get_current_user)):
    student = await db.students.find_one({'user_id': user['id']}, {'_id': 0})
    complaint = {
        'id': str(uuid.uuid4()),
        'student_id': student['id'] if student else "",
        'student_name': user['name'],
        **data.model_dump(), 'status': 'pending', 'remarks': '',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    await db.complaints.insert_one(complaint)
    complaint.pop('_id', None)
    return complaint

@api_router.put("/complaints/{complaint_id}")
async def update_complaint(complaint_id: str, data: ComplaintUpdate, user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Not authorized')
        
    result = await db.complaints.update_one(
        {'id': complaint_id},
        {'$set': {'status': data.status, 'remarks': data.remarks, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Complaint not found')
        
    complaint = await db.complaints.find_one({'id': complaint_id}, {'_id': 0})
    return complaint

# ─── GLOBAL SEARCH ROUTE ───────────────────────────────────────────────────────

def make_flexible_regex(query: str) -> str:
    """WiFi, Wi-Fi, wi fi - sab kuch match karega"""
    # Remove hyphens and spaces, then insert optional separator between chars
    clean = re.sub(r'[-\s]+', '', query.strip())
    if len(clean) < 2:
        return re.escape(query.strip())
    return r'[-\s]?'.join(re.escape(c) for c in clean)

@api_router.get("/search")
async def global_search(q: str = "", user=Depends(get_current_user)):
    if not q or len(q.strip()) < 2:
        return {'results': []}

    flex_pattern = make_flexible_regex(q)
    regex_filter = {'$regex': flex_pattern, '$options': 'i'}
    role = user.get('role', 'student')
    results = []

    # --- ADMIN: sab kuch search kar sakta hai ---
    if role == 'admin':
        # Students
        students = await db.students.find({'$or': [
            {'full_name': regex_filter}, {'roll_number': regex_filter}, {'email': regex_filter}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for s in students:
            results.append({'type': 'student', 'title': s['full_name'],
                'subtitle': f"Roll: {s['roll_number']} | {s.get('email', '')}",
                'path': '/students', 'id': s['id']})

        # Faculty
        faculty = await db.faculty.find({'$or': [
            {'name': regex_filter}, {'email': regex_filter}, {'faculty_id_number': regex_filter}, {'designation': regex_filter}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for f in faculty:
            results.append({'type': 'faculty', 'title': f['name'],
                'subtitle': f"ID: {f['faculty_id_number']} | {f.get('designation', '')}",
                'path': '/faculty-members', 'id': f['id']})

        # Departments
        depts = await db.departments.find({'$or': [
            {'name': regex_filter}, {'code': regex_filter}, {'description': regex_filter}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for d in depts:
            results.append({'type': 'department', 'title': d['name'],
                'subtitle': f"Code: {d['code']}",
                'path': '/departments', 'id': d['id']})

        # Subjects
        subjects = await db.subjects.find({'$or': [
            {'name': regex_filter}, {'code': regex_filter}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for s in subjects:
            results.append({'type': 'subject', 'title': s['name'],
                'subtitle': f"Code: {s['code']} | Semester {s.get('semester', '')}",
                'path': '/subjects', 'id': s['id']})

        # Notices
        notices = await db.notices.find({'$or': [
            {'title': regex_filter}, {'description': regex_filter}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for n in notices:
            results.append({'type': 'notice', 'title': n['title'],
                'subtitle': f"Priority: {n.get('priority', 'medium')} | {n.get('date', '')}",
                'path': '/notices', 'id': n['id']})

        # Complaints
        complaints = await db.complaints.find({'$or': [
            {'title': regex_filter}, {'description': regex_filter}, {'student_name': regex_filter}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for c in complaints:
            results.append({'type': 'complaint', 'title': c['title'],
                'subtitle': f"By: {c.get('student_name', '')} | Status: {c.get('status', '')}",
                'path': '/complaints', 'id': c['id']})

    # --- FACULTY: students, subjects, notices search kar sakta hai ---
    elif role == 'faculty':
        faculty_profile = await get_faculty_profile_by_user(user['id'])
        faculty_dept = faculty_profile.get('department_id', '') if faculty_profile else ''

        # Students
        students = await db.students.find({'$and': [
            {'department_id': faculty_dept},
            {'$or': [{'full_name': regex_filter}, {'roll_number': regex_filter}, {'email': regex_filter}]}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for s in students:
            results.append({'type': 'student', 'title': s['full_name'],
                'subtitle': f"Roll: {s['roll_number']} | Sem {s.get('semester', '')}",
                'path': '/students', 'id': s['id']})

        # Subjects
        subjects = await db.subjects.find({'$and': [
            {'department_id': faculty_dept},
            {'$or': [{'name': regex_filter}, {'code': regex_filter}]}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for s in subjects:
            results.append({'type': 'subject', 'title': s['name'],
                'subtitle': f"Code: {s['code']} | Semester {s.get('semester', '')}",
                'path': '/subjects', 'id': s['id']})

        # Notices
        notices = await db.notices.find({'$and': [
            {'$or': [{'audience': 'all'}, {'audience': 'faculty'}]},
            {'$or': [{'title': regex_filter}, {'description': regex_filter}]}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for n in notices:
            results.append({'type': 'notice', 'title': n['title'],
                'subtitle': f"Priority: {n.get('priority', 'medium')} | {n.get('date', '')}",
                'path': '/notices', 'id': n['id']})

    # --- STUDENT: sirf apne notices, subjects aur apni complaints ---
    else:
        # Apni student profile dhundo
        student_profile = await get_student_profile_by_user(user['id'])

        # Subjects
        subject_query = {'$or': [{'name': regex_filter}, {'code': regex_filter}]}
        if student_profile:
            subject_query['department_id'] = student_profile.get('department_id', '')
            subject_query['semester'] = student_profile.get('semester', 0)

        subjects = await db.subjects.find(subject_query, {'_id': 0}).limit(5).to_list(5)
        for s in subjects:
            results.append({'type': 'subject', 'title': s['name'],
                'subtitle': f"Code: {s['code']} | Semester {s.get('semester', '')}",
                'path': '/marks', 'id': s['id']})

        # Notices (sirf student/all audience)
        notices = await db.notices.find({'$and': [
            {'$or': [{'audience': 'all'}, {'audience': 'students'}]},
            {'$or': [{'title': regex_filter}, {'description': regex_filter}]}
        ]}, {'_id': 0}).limit(5).to_list(5)
        for n in notices:
            results.append({'type': 'notice', 'title': n['title'],
                'subtitle': f"Priority: {n.get('priority', 'medium')} | {n.get('date', '')}",
                'path': '/notices', 'id': n['id']})

        # Apni complaints
        if student_profile:
            complaints = await db.complaints.find({'$and': [
                {'student_id': student_profile['id']},
                {'$or': [{'title': regex_filter}, {'description': regex_filter}]}
            ]}, {'_id': 0}).limit(5).to_list(5)
            for c in complaints:
                results.append({'type': 'complaint', 'title': c['title'],
                    'subtitle': f"Status: {c.get('status', '')}",
                    'path': '/complaints', 'id': c['id']})

    return {'results': results}

# ─── DASHBOARD ROUTES ───────────────────────────────────────────────────────────

@api_router.get("/dashboard/stats")
async def dashboard_stats(user=Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')

    total_students = await db.students.count_documents({})
    total_faculty = await db.faculty.count_documents({})
    total_departments = await db.departments.count_documents({})
    total_subjects = await db.subjects.count_documents({})
    total_notices = await db.notices.count_documents({})
    pending_complaints = await db.complaints.count_documents({'status': 'pending'})
    
    total_att = await db.attendance.count_documents({})
    present_att = await db.attendance.count_documents({'status': {'$in': ['present', 'late']}})
    avg_attendance = round((present_att / total_att) * 100, 1) if total_att > 0 else 0
    
    dept_stats = await db.students.aggregate([
        {'$group': {'_id': '$department_id', 'count': {'$sum': 1}}}
    ]).to_list(50)
    
    depts = {d['id']: d['name'] for d in await db.departments.find({}, {'_id': 0}).to_list(50)}
    dept_distribution = [{'name': depts.get(d['_id'], 'Unknown'), 'count': d['count']} for d in dept_stats]
    
    attendance_trend = []
    for i in range(6, -1, -1):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        date_str = day.strftime('%Y-%m-%d')
        day_name = day.strftime('%a')
        
        day_total = await db.attendance.count_documents({'date': date_str})
        day_present = await db.attendance.count_documents({'date': date_str, 'status': {'$in': ['present', 'late']}})
        pct = round((day_present / day_total) * 100, 1) if day_total > 0 else 0
        attendance_trend.append({'date': date_str, 'day': day_name, 'percentage': pct})
        
    recent_notices = await db.notices.find({}, {'_id': 0}).sort('created_at', -1).limit(5).to_list(5)
    recent_complaints = await db.complaints.find({}, {'_id': 0}).sort('created_at', -1).limit(5).to_list(5)
    
    return {
        'total_students': total_students, 'total_faculty': total_faculty,
        'total_departments': total_departments, 'total_subjects': total_subjects,
        'total_notices': total_notices, 'pending_complaints': pending_complaints,
        'avg_attendance': avg_attendance, 'dept_distribution': dept_distribution,
        'attendance_trend': attendance_trend, 'recent_notices': recent_notices,
        'recent_complaints': recent_complaints
    }

@api_router.get("/dashboard/student")
async def student_dashboard(user=Depends(get_current_user)):
    if user['role'] != 'student':
        raise HTTPException(status_code=403, detail='Student access required')

    student = await get_student_profile_by_user(user['id'])
    if not student:
        raise HTTPException(status_code=404, detail='Student profile not found')
        
    student_id = student['id']
    
    att_pipeline = [
        {'$match': {'student_id': student_id}},
        {'$group': {'_id': None, 'total': {'$sum': 1}, 'present': {'$sum': {'$cond': [{'$in': ['$status', ['present', 'late']]}, 1, 0]}}}}
    ]
    att_result = await db.attendance.aggregate(att_pipeline).to_list(1)
    att_pct = round((att_result[0]['present'] / att_result[0]['total']) * 100, 1) if att_result and att_result[0]['total'] > 0 else 0
    
    marks = await db.marks.find({'student_id': student_id}, {'_id': 0}).to_list(50)
    subjects = {s['id']: s for s in await db.subjects.find({}, {'_id': 0}).to_list(100)}
    for m in marks:
        subj = subjects.get(m['subject_id'], {})
        m['subject_name'] = subj.get('name', 'Unknown')
        m['subject_code'] = subj.get('code', '')
        
    avg_marks = round(sum(m['percentage'] for m in marks) / len(marks), 1) if marks else 0
    
    notices = await db.notices.find({'$or': [{'audience': 'all'}, {'audience': 'students'}]}, {'_id': 0})\
        .sort('created_at', -1).limit(5).to_list(5)
        
    complaints = await db.complaints.find({'student_id': student_id}, {'_id': 0}).sort('created_at', -1).to_list(10)
    dept = await db.departments.find_one({'id': student.get('department_id')}, {'_id': 0})
    
    return {
        'student': student, 'department': dept, 'attendance_percentage': att_pct,
        'marks': marks, 'avg_marks': avg_marks, 'notices': notices,
        'complaints': complaints, 'total_subjects': len(marks)
    }

@api_router.get("/dashboard/faculty")
async def faculty_dashboard(user=Depends(get_current_user)):
    if user['role'] != 'faculty':
        raise HTTPException(status_code=403, detail='Faculty access required')

    faculty = await db.faculty.find_one({'user_id': user['id']}, {'_id': 0})
    if not faculty:
        raise HTTPException(status_code=404, detail='Faculty profile not found')
        
    dept = await db.departments.find_one({'id': faculty.get('department_id', '')}, {'_id': 0})
    subjects = await db.subjects.find({'department_id': faculty.get('department_id', '')}, {'_id': 0}).to_list(50)
    students_count = await db.students.count_documents({'department_id': faculty.get('department_id', '')})
    notices = await db.notices.find({}, {'_id': 0}).sort('created_at', -1).limit(5).to_list(5)
    
    return {
        'faculty': faculty, 'department': dept, 'subjects': subjects,
        'students_count': students_count, 'notices': notices
    }

# ─── SEED DATA ──────────────────────────────────────────────────────────────────

@api_router.post("/seed")
async def seed_data():
    existing = await db.users.count_documents({})
    if existing > 0:
        return {'message': 'Data already seeded', 'seeded': False}
        
    dept_cs_id, dept_ec_id, dept_me_id = str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4())
    departments = [
        {'id': dept_cs_id, 'name': 'Computer Science', 'code': 'CS', 'head_faculty_id': '', 'description': 'Department of Computer Science and Engineering', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': dept_ec_id, 'name': 'Electronics & Communication', 'code': 'EC', 'head_faculty_id': '', 'description': 'Department of Electronics and Communication Engineering', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': dept_me_id, 'name': 'Mechanical Engineering', 'code': 'ME', 'head_faculty_id': '', 'description': 'Department of Mechanical Engineering', 'created_at': datetime.now(timezone.utc).isoformat()}
    ]
    
    subj_ids = [str(uuid.uuid4()) for _ in range(5)]
    subjects = [
        {'id': subj_ids[0], 'name': 'Data Structures & Algorithms', 'code': 'CS301', 'department_id': dept_cs_id, 'semester': 3, 'credits': 4, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': subj_ids[1], 'name': 'Database Management Systems', 'code': 'CS302', 'department_id': dept_cs_id, 'semester': 3, 'credits': 4, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': subj_ids[2], 'name': 'Computer Networks', 'code': 'CS501', 'department_id': dept_cs_id, 'semester': 5, 'credits': 3, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': subj_ids[3], 'name': 'Digital Electronics', 'code': 'EC301', 'department_id': dept_ec_id, 'semester': 3, 'credits': 4, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': subj_ids[4], 'name': 'Thermodynamics', 'code': 'ME301', 'department_id': dept_me_id, 'semester': 3, 'credits': 3, 'created_at': datetime.now(timezone.utc).isoformat()}
    ]
    
    admin_id = str(uuid.uuid4())
    users = [
        {'id': admin_id, 'email': 'admin@smartcampus.edu', 'password_hash': hash_pw('admin123'), 'name': 'Campus Administrator', 'role': 'admin'}
    ]
    
    faculty_data = [
        ("Dr. Rajesh Kumar", "FAC001", dept_cs_id, "Professor", "rajesh.kumar@smartcampus.edu", "+91 9876543210"),
        ("Dr. Priya Sharma", "FAC002", dept_cs_id, "Associate Professor", "priya.sharma@smartcampus.edu", "+91 9876543211"),
        ("Dr. Amit Patel", "FAC003", dept_ec_id, "Professor", "amit.patel@smartcampus.edu", "+91 9876543212"),
        ("Dr. Neha Singh", "FAC004", dept_me_id, "Assistant Professor", "neha.singh@smartcampus.edu", "+91 9876543213"),
        ("Dr. Sanjay Verma", "FAC005", dept_cs_id, "Assistant Professor", "sanjay.verma@smartcampus.edu", "+91 9876543214")
    ]
    
    faculty_records = []
    for name, fid, dept, desig, email, phone in faculty_data:
        uid, fac_id = str(uuid.uuid4()), str(uuid.uuid4())
        users.append({'id': uid, 'email': email, 'password_hash': hash_pw('faculty123'), 'name': name, 'role': 'faculty'})
        faculty_records.append({'id': fac_id, 'user_id': uid, 'name': name, 'faculty_id_number': fid, 'department_id': dept, 'designation': desig, 'email': email, 'phone': phone, 'created_at': datetime.now(timezone.utc).isoformat()})
        
    departments[0]['head_faculty_id'] = faculty_records[0]['id']
    departments[1]['head_faculty_id'] = faculty_records[2]['id']
    departments[2]['head_faculty_id'] = faculty_records[3]['id']
    
    student_data = [
        ("Aarav Mehta", "CS2023001", "EN2023001", "aarav.mehta@smartcampus.edu", "Male", dept_cs_id, 3, "A"),
        ("Priya Gupta", "CS2023002", "EN2023002", "priya.gupta@smartcampus.edu", "Female", dept_cs_id, 3, "A"),
        ("Rohan Singh", "CS2023003", "EN2023003", "rohan.singh@smartcampus.edu", "Male", dept_cs_id, 3, "A"),
        ("Sneha Patel", "CS2023004", "EN2023004", "sneha.patel@smartcampus.edu", "Female", dept_cs_id, 3, "B"),
        ("Vivek Kumar", "CS2023005", "EN2023005", "vivek.kumar@smartcampus.edu", "Male", dept_cs_id, 3, "B"),
        ("Ananya Reddy", "CS2022001", "EN2022001", "ananya.reddy@smartcampus.edu", "Female", dept_cs_id, 5, "A"),
        ("Karan Joshi", "CS2022002", "EN2022002", "karan.joshi@smartcampus.edu", "Male", dept_cs_id, 5, "A"),
        ("Ishita Sharma", "CS2022003", "EN2022003", "ishita.sharma@smartcampus.edu", "Female", dept_cs_id, 5, "A"),
        ("Aditya Verma", "EC2023001", "EN2023006", "aditya.verma@smartcampus.edu", "Male", dept_ec_id, 3, "A"),
        ("Meera Iyer", "EC2023002", "EN2023007", "meera.iyer@smartcampus.edu", "Female", dept_ec_id, 3, "A"),
        ("Rahul Nair", "EC2023003", "EN2023008", "rahul.nair@smartcampus.edu", "Male", dept_ec_id, 3, "B"),
        ("Pooja Desai", "EC2023004", "EN2023009", "pooja.desai@smartcampus.edu", "Female", dept_ec_id, 3, "B"),
        ("Arjun Malhotra", "EC2022001", "EN2022004", "arjun.malhotra@smartcampus.edu", "Male", dept_ec_id, 5, "A"),
        ("Divya Saxena", "EC2022002", "EN2022005", "divya.saxena@smartcampus.edu", "Female", dept_ec_id, 5, "A"),
        ("Nikhil Chauhan", "ME2023001", "EN2023010", "nikhil.chauhan@smartcampus.edu", "Male", dept_me_id, 3, "A"),
        ("Riya Agarwal", "ME2023002", "EN2023011", "riya.agarwal@smartcampus.edu", "Female", dept_me_id, 3, "A"),
        ("Siddharth Rao", "ME2023003", "EN2023012", "siddharth.rao@smartcampus.edu", "Male", dept_me_id, 3, "B"),
        ("Kavya Jain", "ME2022001", "EN2022006", "kavya.jain@smartcampus.edu", "Female", dept_me_id, 5, "A"),
        ("Manish Tiwari", "ME2022002", "EN2022007", "manish.tiwari@smartcampus.edu", "Male", dept_me_id, 5, "A"),
        ("Tanya Bhatia", "ME2022003", "EN2022008", "tanya.bhatia@smartcampus.edu", "Female", dept_me_id, 5, "B")
    ]
    
    student_records = []
    for name, roll, enroll, email, gender, dept, sem, sec in student_data:
        uid, sid = str(uuid.uuid4()), str(uuid.uuid4())
        users.append({'id': uid, 'email': email, 'password_hash': hash_pw('student123'), 'name': name, 'role': 'student'})
        student_records.append({
            'id': sid, 'user_id': uid, 'full_name': name, 'roll_number': roll,
            'enrollment_number': enroll, 'email': email, 'phone': f'+91 98{random.randint(10000000,99999999)}',
            'gender': gender, 'date_of_birth': f'{random.randint(2000,2003)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}',
            'address': f'{random.randint(1,500)}, Sector {random.randint(1,50)}, New Delhi',
            'department_id': dept, 'semester': sem, 'section': sec,
            'admission_date': '2023-08-01' if sem <= 3 else '2022-08-01',
            'status': 'active', 'created_at': datetime.now(timezone.utc).isoformat()
        })
        
    attendance_records = []
    for student in student_records:
        student_subjects = [s for s in subjects if s['department_id'] == student['department_id'] and s['semester'] == student['semester']]
        for subj in student_subjects:
            for day_offset in range(14):
                day_dt = datetime.now(timezone.utc) - timedelta(days=day_offset)
                if day_dt.weekday() >= 5: continue
                attendance_records.append({
                    'id': str(uuid.uuid4()), 'student_id': student['id'], 'subject_id': subj['id'],
                    'date': day_dt.strftime('%Y-%m-%d'),
                    'status': random.choices(['present', 'absent', 'late'], weights=[80, 10, 10])[0],
                    'marked_by': faculty_records[0]['id'], 'created_at': datetime.now(timezone.utc).isoformat()
                })
                
    marks_records = []
    for student in student_records:
        student_subjects = [s for s in subjects if s['department_id'] == student['department_id'] and s['semester'] == student['semester']]
        for subj in student_subjects:
            internal, practical, final = round(random.uniform(15, 30), 1), round(random.uniform(10, 20), 1), round(random.uniform(20, 50), 1)
            total = round(internal + practical + final, 1)
            marks_records.append({
                'id': str(uuid.uuid4()), 'student_id': student['id'], 'subject_id': subj['id'],
                'internal_marks': internal, 'practical_marks': practical, 'final_marks': final,
                'total': total, 'percentage': round(total, 1), 'grade': calc_grade(total),
                'result_status': 'Pass' if total >= 40 else 'Fail',
                'entered_by': faculty_records[0]['id'], 'created_at': datetime.now(timezone.utc).isoformat()
            })
            
    notices = [
        {'id': str(uuid.uuid4()), 'title': 'Mid-Semester Examination Schedule', 'description': 'Mid-semester examinations for all departments commence from March 15, 2025. Collect hall tickets from the examination cell by March 10.', 'priority': 'high', 'audience': 'all', 'posted_by': 'Campus Administrator', 'posted_by_id': admin_id, 'date': '2025-03-01', 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'title': 'Annual Sports Day Registration', 'description': 'Register for Annual Sports Day events. Last date: March 20. Contact your class representative for details.', 'priority': 'medium', 'audience': 'students', 'posted_by': 'Dr. Rajesh Kumar', 'posted_by_id': faculty_records[0]['id'], 'date': '2025-02-28', 'created_at': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()},
        {'id': str(uuid.uuid4()), 'title': 'Faculty Development Program', 'description': 'Two-day FDP on "AI in Education" on March 25-26. All faculty members confirm attendance.', 'priority': 'medium', 'audience': 'faculty', 'posted_by': 'Campus Administrator', 'posted_by_id': admin_id, 'date': '2025-02-25', 'created_at': (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()},
        {'id': str(uuid.uuid4()), 'title': 'Library Hours Extended', 'description': 'Library open till 9 PM during examination period. Reading room and computer lab available for exam preparation.', 'priority': 'low', 'audience': 'all', 'posted_by': 'Campus Administrator', 'posted_by_id': admin_id, 'date': '2025-02-20', 'created_at': (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()},
        {'id': str(uuid.uuid4()), 'title': 'Campus Placement Drive - TCS', 'description': 'TCS placement drive on April 5, 2025. Eligible students (6th sem+, 60%+ aggregate) register on placement portal by March 28.', 'priority': 'high', 'audience': 'students', 'posted_by': 'Dr. Priya Sharma', 'posted_by_id': faculty_records[1]['id'], 'date': '2025-02-18', 'created_at': (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()}
    ]
    
    complaints = [
        {'id': str(uuid.uuid4()), 'student_id': student_records[0]['id'], 'student_name': 'Aarav Mehta', 'title': 'Wi-Fi Issues in Lab 3', 'description': 'Wi-Fi in Computer Lab 3 has been intermittent for a week, affecting practical sessions.', 'status': 'in_progress', 'remarks': 'IT team investigating router replacement.', 'created_at': (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(), 'updated_at': (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()},
        {'id': str(uuid.uuid4()), 'student_id': student_records[3]['id'], 'student_name': 'Sneha Patel', 'title': 'Broken Projector in Room 201', 'description': 'Projector in classroom 201 display is flickering during lectures.', 'status': 'pending', 'remarks': '', 'created_at': (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(), 'updated_at': (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()},
        {'id': str(uuid.uuid4()), 'student_id': student_records[8]['id'], 'student_name': 'Aditya Verma', 'title': 'Request for Extra Lab Hours', 'description': 'Need additional lab hours for Digital Electronics project. Current 2-hour slots insufficient.', 'status': 'resolved', 'remarks': 'Extra lab hours approved for Saturday mornings.', 'created_at': (datetime.now(timezone.utc) - timedelta(days=15)).isoformat(), 'updated_at': (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()},
        {'id': str(uuid.uuid4()), 'student_id': student_records[14]['id'], 'student_name': 'Nikhil Chauhan', 'title': 'Water Cooler Not Working', 'description': 'Water cooler near ME department not cooling properly. Needs repair.', 'status': 'pending', 'remarks': '', 'created_at': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(), 'updated_at': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()},
        {'id': str(uuid.uuid4()), 'student_id': student_records[5]['id'], 'student_name': 'Ananya Reddy', 'title': 'Attendance Discrepancy', 'description': 'Computer Networks attendance shows 2 incorrect absences. Have evidence of attendance.', 'status': 'in_progress', 'remarks': 'Forwarded to subject teacher for verification.', 'created_at': (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(), 'updated_at': (datetime.now(timezone.utc) - timedelta(days=4)).isoformat()}
    ]
    
    await db.users.insert_many(users)
    await db.departments.insert_many(departments)
    await db.subjects.insert_many(subjects)
    await db.faculty.insert_many(faculty_records)
    await db.students.insert_many(student_records)
    if attendance_records: await db.attendance.insert_many(attendance_records)
    if marks_records: await db.marks.insert_many(marks_records)
    await db.notices.insert_many(notices)
    await db.complaints.insert_many(complaints)
    
    logger.info(f"Seeded: {len(users)} users, {len(student_records)} students, {len(faculty_records)} faculty, {len(attendance_records)} attendance, {len(marks_records)} marks")
    return {'message': 'Demo data seeded successfully', 'seeded': True}

# ─── Support Messages ────────────────────────────────────────────────────────────

@api_router.post("/support-messages")
async def create_support_message(body: SupportMessageCreate, user=Depends(get_current_user)):
    if user.get('role') == 'admin':
        raise HTTPException(status_code=403, detail='Admins cannot send support messages')
    if not body.message.strip():
        raise HTTPException(status_code=400, detail='Message cannot be empty')
    doc = {
        'id': str(uuid.uuid4()),
        'sender_id': user['id'],
        'sender_name': user.get('name', ''),
        'sender_email': user.get('email', ''),
        'sender_role': user.get('role', ''),
        'message': body.message.strip(),
        'status': 'open',
        'admin_reply': '',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat(),
    }
    await db.support_messages.insert_one(doc)
    return {'success': True, 'id': doc['id']}

@api_router.get("/support-messages")
async def get_support_messages(user=Depends(get_current_user)):
    if user.get('role') == 'admin':
        msgs = await db.support_messages.find({}, {'_id': 0}).sort('created_at', -1).limit(50).to_list(50)
    else:
        msgs = await db.support_messages.find({'sender_id': user['id']}, {'_id': 0}).sort('created_at', -1).to_list(20)
    return {'messages': msgs}

@api_router.patch("/support-messages/{msg_id}")
async def update_support_message(msg_id: str, body: SupportMessageReply, user=Depends(get_current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Only admin can update support messages')
    result = await db.support_messages.update_one(
        {'id': msg_id},
        {'$set': {'status': body.status, 'admin_reply': body.admin_reply, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Message not found')
    return {'success': True}

# ─── SIGNUP REQUEST ROUTES ───────────────────────────────────────────────────────

@api_router.post("/signup-requests")
async def submit_signup_request(body: SignupRequestCreate):
    """Public endpoint — no auth required. Student/faculty submits signup request."""
    if body.role != 'student':
        raise HTTPException(status_code=400, detail='Only student signup is allowed. Faculty accounts are created by admin.')
    # Validate email uniqueness across users and pending requests
    existing_user = await db.users.find_one({'email': body.email})
    if existing_user:
        raise HTTPException(status_code=400, detail='An account with this email already exists')
    existing_req = await db.signup_requests.find_one({'email': body.email, 'status': 'pending'})
    if existing_req:
        raise HTTPException(status_code=400, detail='A signup request for this email is already pending')
    doc = {
        'id': str(uuid.uuid4()),
        'full_name': body.full_name,
        'email': body.email,
        'phone': body.phone,
        'role': body.role,
        'department': body.department,
        'department_id': body.department_id,
        'roll_number': body.roll_number,
        'semester': body.semester,
        'date_of_birth': body.date_of_birth,
        'address': body.address,
        'employee_id': body.employee_id,
        'designation': body.designation,
        'id_image_base64': body.id_image_base64,
        'status': 'pending',  # pending | approved | rejected
        'admin_remarks': '',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat(),
    }
    await db.signup_requests.insert_one(doc)
    return {'success': True, 'message': 'Your request has been submitted. Admin will review and activate your account.'}

@api_router.get("/signup-requests")
async def get_signup_requests(user=Depends(get_current_user), status: str = ""):
    """Admin only — get all signup requests."""
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    query = {}
    if status:
        query['status'] = status
    reqs = await db.signup_requests.find(query, {'_id': 0}).sort('created_at', -1).limit(100).to_list(100)
    # Strip base64 image from list view for performance
    for r in reqs:
        r['has_id_image'] = bool(r.get('id_image_base64'))
        r.pop('id_image_base64', None)
    return {'requests': reqs, 'total': len(reqs)}

@api_router.get("/signup-requests/{req_id}")
async def get_signup_request_detail(req_id: str, user=Depends(get_current_user)):
    """Admin only — get full record including ID image."""
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    req = await db.signup_requests.find_one({'id': req_id}, {'_id': 0})
    if not req:
        raise HTTPException(status_code=404, detail='Request not found')
    return req

@api_router.patch("/signup-requests/{req_id}")
async def action_signup_request(req_id: str, body: SignupRequestAction, user=Depends(get_current_user)):
    """Admin only — approve or reject a signup request."""
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    req = await db.signup_requests.find_one({'id': req_id}, {'_id': 0})
    if not req:
        raise HTTPException(status_code=404, detail='Request not found')
    if req['status'] != 'pending':
        raise HTTPException(status_code=400, detail='Request already processed')

    if body.action == 'approve':
        # Create auth user + role profile document so dashboards and management screens can find the record.
        default_password = f"campus@{req['full_name'].split()[0].lower()}123"
        department_id = req.get('department_id', '') or req.get('resolved_department_id', '') or await resolve_department_id(req.get('department', ''))
        if department_id:
            department_record = await db.departments.find_one({'id': department_id}, {'_id': 0, 'name': 1})
            if department_record:
                req['department'] = department_record.get('name', req.get('department', ''))
        new_user = {
            'id': str(uuid.uuid4()),
            'name': req['full_name'],
            'email': req['email'],
            'role': req['role'],
            'password_hash': hash_pw(default_password),
            'department': req.get('department', ''),
            'department_id': department_id,
            'phone': req.get('phone', ''),
            'created_at': datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(new_user)

        if req.get('role') == 'student':
            student_doc = {
                'id': str(uuid.uuid4()),
                'user_id': new_user['id'],
                'full_name': req.get('full_name', ''),
                'roll_number': req.get('roll_number', '') or f"ROLL-{random.randint(10000, 99999)}",
                'enrollment_number': await generate_unique_enrollment_number(department_id),
                'email': req.get('email', ''),
                'phone': req.get('phone', ''),
                'gender': 'Male',
                'date_of_birth': req.get('date_of_birth', ''),
                'address': req.get('address', ''),
                'department_id': department_id,
                'semester': max(1, int(req.get('semester', 1) or 1)),
                'section': 'A',
                'admission_date': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
                'status': 'active',
                'created_at': datetime.now(timezone.utc).isoformat(),
            }
            await db.students.insert_one(student_doc)
        elif req.get('role') == 'faculty':
            faculty_doc = {
                'id': str(uuid.uuid4()),
                'user_id': new_user['id'],
                'name': req.get('full_name', ''),
                'faculty_id_number': req.get('employee_id', '') or f"FAC-{random.randint(10000, 99999)}",
                'department_id': department_id,
                'designation': req.get('designation', '') or 'Faculty',
                'email': req.get('email', ''),
                'phone': req.get('phone', ''),
                'created_at': datetime.now(timezone.utc).isoformat(),
            }
            await db.faculty.insert_one(faculty_doc)

        email_sent = False
        email_error = ''
        if req.get('role') == 'student':
            email_sent, email_error = send_account_credentials_email(req['email'], req['full_name'], default_password)

        await db.signup_requests.update_one(
            {'id': req_id},
            {'$set': {
                'status': 'approved',
                'admin_remarks': body.remarks,
                'approved_user_id': new_user['id'],
                'default_password': default_password,
                'department_id': department_id,
                'resolved_department_id': department_id,
                'approval_email_sent': email_sent,
                'approval_email_error': email_error,
                'approval_email_sent_at': datetime.now(timezone.utc).isoformat() if email_sent else '',
                'updated_at': datetime.now(timezone.utc).isoformat()
            }}
        )
        response_message = 'Account created and approval email sent successfully' if email_sent else 'Account created, but approval email could not be sent'
        return {
            'success': True,
            'message': response_message,
            'default_password': default_password,
            'email_sent': email_sent,
            'email_error': email_error,
        }
    elif body.action == 'reject':
        await db.signup_requests.update_one(
            {'id': req_id},
            {'$set': {'status': 'rejected', 'admin_remarks': body.remarks, 'updated_at': datetime.now(timezone.utc).isoformat()}}
        )
        return {'success': True, 'message': 'Request rejected'}
    else:
        raise HTTPException(status_code=400, detail='Invalid action. Use approve or reject')

@api_router.post("/signup-requests/sync-approved-profiles")
async def sync_approved_signup_profiles(user=Depends(get_current_user)):
    """Admin utility: create or repair student/faculty profiles for approved signup requests."""
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')

    approved_reqs = await db.signup_requests.find({'status': 'approved'}, {'_id': 0}).to_list(500)
    synced = 0

    for req in approved_reqs:
        linked_user_id = req.get('approved_user_id', '')
        linked_user = None
        if linked_user_id:
            linked_user = await db.users.find_one({'id': linked_user_id}, {'_id': 0})
        if not linked_user:
            linked_user = await db.users.find_one({'email': req.get('email', '')}, {'_id': 0})
        if not linked_user:
            continue

        department_id = req.get('department_id', '') or req.get('resolved_department_id', '') or await resolve_department_id(req.get('department', ''))
        user_updates = {}
        if department_id and linked_user.get('department_id') != department_id:
            user_updates['department_id'] = department_id
        if req.get('department') and linked_user.get('department') != req.get('department'):
            user_updates['department'] = req.get('department')
        if user_updates:
            await db.users.update_one({'id': linked_user['id']}, {'$set': user_updates})

        if req.get('role') == 'student':
            existing = await db.students.find_one({'user_id': linked_user['id']}, {'_id': 0})
            if existing:
                student_updates = {}
                if not existing.get('enrollment_number'):
                    student_updates['enrollment_number'] = await generate_unique_enrollment_number(existing.get('department_id', '') or department_id)
                if not existing.get('roll_number') and req.get('roll_number'):
                    student_updates['roll_number'] = req.get('roll_number')
                if not existing.get('date_of_birth') and req.get('date_of_birth'):
                    student_updates['date_of_birth'] = req.get('date_of_birth')
                if not existing.get('address') and req.get('address'):
                    student_updates['address'] = req.get('address')
                if not existing.get('department_id') and department_id:
                    student_updates['department_id'] = department_id
                if not existing.get('phone') and req.get('phone'):
                    student_updates['phone'] = req.get('phone')
                if not existing.get('email') and linked_user.get('email'):
                    student_updates['email'] = linked_user.get('email')
                if student_updates:
                    await db.students.update_one({'id': existing['id']}, {'$set': student_updates})
                    synced += 1
                continue
            await db.students.insert_one({
                'id': str(uuid.uuid4()),
                'user_id': linked_user['id'],
                'full_name': req.get('full_name', linked_user.get('name', '')),
                'roll_number': req.get('roll_number', '') or f"ROLL-{random.randint(10000, 99999)}",
                'enrollment_number': await generate_unique_enrollment_number(department_id),
                'email': linked_user.get('email', ''),
                'phone': req.get('phone', ''),
                'gender': 'Male',
                'date_of_birth': req.get('date_of_birth', ''),
                'address': req.get('address', ''),
                'department_id': department_id,
                'semester': max(1, int(req.get('semester', 1) or 1)),
                'section': 'A',
                'admission_date': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
                'status': 'active',
                'created_at': datetime.now(timezone.utc).isoformat(),
            })
            synced += 1
        elif req.get('role') == 'faculty':
            existing = await db.faculty.find_one({'user_id': linked_user['id']}, {'_id': 0, 'id': 1})
            if existing:
                continue
            await db.faculty.insert_one({
                'id': str(uuid.uuid4()),
                'user_id': linked_user['id'],
                'name': req.get('full_name', linked_user.get('name', '')),
                'faculty_id_number': req.get('employee_id', '') or f"FAC-{random.randint(10000, 99999)}",
                'department_id': department_id,
                'designation': req.get('designation', '') or 'Faculty',
                'email': linked_user.get('email', ''),
                'phone': req.get('phone', ''),
                'created_at': datetime.now(timezone.utc).isoformat(),
            })
            await db.users.update_one({'id': linked_user['id']}, {'$set': {'department_id': department_id}})
            synced += 1

    return {'success': True, 'synced_profiles': synced, 'checked_requests': len(approved_reqs)}

# ─── APP CONFIG ─────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    count = await db.users.count_documents({})
    if count == 0:
        await seed_data()
        logger.info("Demo data seeded on startup")

app.include_router(api_router)

# Note: CORS Middleware humne shuru mein move kar diya hai taaki routing se pehle load ho.

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

@app.on_event("shutdown")
async def shutdown():
    client.close()
