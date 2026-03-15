import requests
import sys
import json
from datetime import datetime
import uuid

class SmartCampusAPITester:
    def __init__(self, base_url="https://student-hub-480.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.faculty_token = None  
        self.student_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'students': [],
            'faculty': [],
            'departments': [],
            'subjects': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text[:200]}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_authentication(self):
        """Test login for all user roles"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        # Test Admin login
        success, response = self.run_test(
            "Admin Login",
            "POST", 
            "auth/login",
            200,
            data={"email": "admin@smartcampus.edu", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"Admin token acquired: {self.admin_token[:20]}...")
        
        # Test Faculty login
        success, response = self.run_test(
            "Faculty Login",
            "POST",
            "auth/login", 
            200,
            data={"email": "rajesh.kumar@smartcampus.edu", "password": "faculty123"}
        )
        if success and 'token' in response:
            self.faculty_token = response['token']
            print(f"Faculty token acquired: {self.faculty_token[:20]}...")
            
        # Test Student login
        success, response = self.run_test(
            "Student Login",
            "POST",
            "auth/login",
            200,
            data={"email": "aarav.mehta@smartcampus.edu", "password": "student123"}
        )
        if success and 'token' in response:
            self.student_token = response['token']
            print(f"Student token acquired: {self.student_token[:20]}...")

        # Test invalid credentials
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@example.com", "password": "wrongpass"}
        )

        return bool(self.admin_token and self.faculty_token and self.student_token)

    def test_dashboard_stats(self):
        """Test dashboard stats API"""
        print("\n" + "="*50)  
        print("TESTING DASHBOARD STATS")
        print("="*50)
        
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats", 
            200,
            token=self.admin_token
        )
        
        if success:
            # Validate expected stats exist
            expected_fields = ['total_students', 'total_faculty', 'total_departments', 
                             'avg_attendance', 'pending_complaints', 'total_notices']
            for field in expected_fields:
                if field in response:
                    print(f"  ✓ {field}: {response[field]}")
                else:
                    print(f"  ❌ Missing field: {field}")

    def test_student_apis(self):
        """Test student CRUD operations"""
        print("\n" + "="*50)
        print("TESTING STUDENT APIS") 
        print("="*50)
        
        # Get all students
        success, response = self.run_test(
            "Get Students",
            "GET",
            "students",
            200,
            token=self.admin_token
        )
        
        if success and 'students' in response:
            print(f"  Found {len(response['students'])} students")
            
        # Test student creation (Admin only)
        new_student_data = {
            "full_name": f"Test Student {datetime.now().strftime('%H%M%S')}",
            "roll_number": f"TEST{datetime.now().strftime('%H%M%S')}",
            "enrollment_number": f"EN{datetime.now().strftime('%H%M%S')}",
            "email": f"test.student.{datetime.now().strftime('%H%M%S')}@smartcampus.edu",
            "phone": "+91 9876543210",
            "gender": "Male",
            "department_id": "",
            "semester": 1,
            "section": "A",
            "status": "active"
        }
        
        success, response = self.run_test(
            "Create Student",
            "POST",
            "students",
            200,
            data=new_student_data,
            token=self.admin_token
        )
        
        if success and 'id' in response:
            student_id = response['id']
            self.created_resources['students'].append(student_id)
            print(f"  Created student with ID: {student_id}")
            
            # Test get single student
            self.run_test(
                "Get Single Student", 
                "GET",
                f"students/{student_id}",
                200,
                token=self.admin_token
            )

        # Test unauthorized student creation (Faculty token)
        self.run_test(
            "Unauthorized Student Creation",
            "POST", 
            "students",
            403,
            data=new_student_data,
            token=self.faculty_token
        )

    def test_faculty_apis(self):
        """Test faculty CRUD operations"""
        print("\n" + "="*50)
        print("TESTING FACULTY APIS")
        print("="*50)
        
        # Get all faculty
        success, response = self.run_test(
            "Get Faculty",
            "GET", 
            "faculty",
            200,
            token=self.admin_token
        )
        
        if success and 'faculty' in response:
            print(f"  Found {len(response['faculty'])} faculty members")

        # Create new faculty
        new_faculty_data = {
            "name": f"Test Faculty {datetime.now().strftime('%H%M%S')}",
            "faculty_id_number": f"FAC{datetime.now().strftime('%H%M%S')}",
            "email": f"test.faculty.{datetime.now().strftime('%H%M%S')}@smartcampus.edu",
            "phone": "+91 9876543211",
            "designation": "Assistant Professor",
            "department_id": ""
        }
        
        success, response = self.run_test(
            "Create Faculty",
            "POST",
            "faculty", 
            200,
            data=new_faculty_data,
            token=self.admin_token
        )
        
        if success and 'id' in response:
            faculty_id = response['id']
            self.created_resources['faculty'].append(faculty_id)
            print(f"  Created faculty with ID: {faculty_id}")

    def test_department_apis(self):
        """Test department CRUD operations"""
        print("\n" + "="*50)
        print("TESTING DEPARTMENT APIS")
        print("="*50)
        
        # Get all departments
        success, response = self.run_test(
            "Get Departments",
            "GET",
            "departments", 
            200,
            token=self.admin_token
        )
        
        if success and 'departments' in response:
            print(f"  Found {len(response['departments'])} departments")

    def test_subject_apis(self):
        """Test subject CRUD operations"""
        print("\n" + "="*50)
        print("TESTING SUBJECT APIS")
        print("="*50)
        
        # Get all subjects
        success, response = self.run_test(
            "Get Subjects",
            "GET",
            "subjects",
            200, 
            token=self.admin_token
        )
        
        if success and 'subjects' in response:
            print(f"  Found {len(response['subjects'])} subjects")

    def test_attendance_apis(self):
        """Test attendance management APIs"""
        print("\n" + "="*50)
        print("TESTING ATTENDANCE APIS")
        print("="*50)
        
        # Get attendance records
        success, response = self.run_test(
            "Get Attendance", 
            "GET",
            "attendance",
            200,
            token=self.admin_token
        )
        
        if success and 'attendance' in response:
            print(f"  Found {len(response['attendance'])} attendance records")

        # Test student attendance view
        success, response = self.run_test(
            "Student Attendance View",
            "GET", 
            "attendance",
            200,
            token=self.student_token
        )

    def test_marks_apis(self):
        """Test marks/results APIs"""
        print("\n" + "="*50)
        print("TESTING MARKS APIS")
        print("="*50)
        
        # Get marks
        success, response = self.run_test(
            "Get Marks",
            "GET",
            "marks",
            200,
            token=self.admin_token
        )
        
        if success and 'marks' in response:
            print(f"  Found {len(response['marks'])} marks records")

        # Test student marks view
        success, response = self.run_test(
            "Student Marks View", 
            "GET",
            "marks",
            200,
            token=self.student_token
        )

    def test_notice_apis(self):
        """Test notice board APIs"""
        print("\n" + "="*50)
        print("TESTING NOTICE APIS")
        print("="*50)
        
        # Get notices
        success, response = self.run_test(
            "Get Notices",
            "GET",
            "notices",
            200,
            token=self.admin_token
        )
        
        if success and 'notices' in response:
            print(f"  Found {len(response['notices'])} notices")

        # Create notice (Admin)
        new_notice = {
            "title": f"Test Notice {datetime.now().strftime('%H:%M:%S')}",
            "description": "This is a test notice created during API testing",
            "priority": "medium",
            "audience": "all"
        }
        
        success, response = self.run_test(
            "Create Notice",
            "POST", 
            "notices",
            200,
            data=new_notice,
            token=self.admin_token
        )

    def test_complaint_apis(self):
        """Test complaint management APIs"""
        print("\n" + "="*50) 
        print("TESTING COMPLAINT APIS")
        print("="*50)
        
        # Get complaints
        success, response = self.run_test(
            "Get Complaints",
            "GET",
            "complaints",
            200,
            token=self.admin_token
        )
        
        if success and 'complaints' in response:
            print(f"  Found {len(response['complaints'])} complaints")

        # Student create complaint
        new_complaint = {
            "title": f"Test Complaint {datetime.now().strftime('%H:%M:%S')}",
            "description": "This is a test complaint created during API testing"
        }
        
        success, response = self.run_test(
            "Student Create Complaint",
            "POST",
            "complaints", 
            200,
            data=new_complaint,
            token=self.student_token
        )

    def test_role_based_dashboards(self):
        """Test role-specific dashboard endpoints"""
        print("\n" + "="*50)
        print("TESTING ROLE-BASED DASHBOARDS")
        print("="*50)
        
        # Test student dashboard
        self.run_test(
            "Student Dashboard",
            "GET",
            "dashboard/student",
            200,
            token=self.student_token
        )
        
        # Test faculty dashboard  
        self.run_test(
            "Faculty Dashboard",
            "GET",
            "dashboard/faculty",
            200,
            token=self.faculty_token
        )

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n" + "="*50)
        print("CLEANING UP TEST DATA")
        print("="*50)
        
        # Delete created students
        for student_id in self.created_resources['students']:
            self.run_test(
                f"Delete Student {student_id}",
                "DELETE",
                f"students/{student_id}",
                200,
                token=self.admin_token
            )
            
        # Delete created faculty
        for faculty_id in self.created_resources['faculty']:
            self.run_test(
                f"Delete Faculty {faculty_id}",
                "DELETE", 
                f"faculty/{faculty_id}",
                200,
                token=self.admin_token
            )

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Smart Campus API Test Suite")
        print("="*60)
        
        # Step 1: Authentication (critical)
        auth_success = self.test_authentication()
        if not auth_success:
            print("❌ Authentication failed - stopping tests")
            return False
            
        # Step 2: Test all endpoints
        self.test_dashboard_stats()
        self.test_student_apis() 
        self.test_faculty_apis()
        self.test_department_apis()
        self.test_subject_apis()
        self.test_attendance_apis()
        self.test_marks_apis()
        self.test_notice_apis()
        self.test_complaint_apis()
        self.test_role_based_dashboards()
        
        # Step 3: Cleanup
        self.cleanup_test_data()
        
        # Final results
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = SmartCampusAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())