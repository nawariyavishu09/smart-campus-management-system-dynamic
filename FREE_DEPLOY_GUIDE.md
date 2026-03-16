# FREE DEPLOYMENT GUIDE - Smart Campus Management System

## Yeh Guide Aapko Step-by-Step Batayegi Ki Kaise Free Mein Deploy Karna Hai

---

## Architecture:
- **Database**: MongoDB Atlas (FREE - 512MB)
- **Backend**: Render.com (FREE tier)
- **Frontend**: Vercel (FREE tier)

---

## STEP 1: MongoDB Atlas Setup (FREE Database)

1. Go to **https://www.mongodb.com/atlas** → "Try Free"
2. Sign up with Google/Email
3. Choose **FREE Shared Cluster** (M0 Sandbox - FREE forever)
4. Select region → **Mumbai (ap-south-1)** for India
5. Click "Create Cluster" (takes 1-3 minutes)

### Get Connection String:
1. Click **"Connect"** on your cluster
2. Click **"Connect your application"**
3. Copy the connection string, it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. **SAVE THIS** - you'll need it for backend deployment

### Network Access:
1. Go to **Network Access** → "Add IP Address"
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click "Confirm"

---

## STEP 2: Push Code to GitHub

1. Go to **https://github.com** → Create new repository
2. Name it: `smart-campus-management-system`
3. Keep it **Public** (needed for free deployment)
4. Run these commands in your terminal:

```powershell
cd "c:\Users\nawar\Downloads\App Building\smart-campus-management-system-main\smart-campus-management-system-main"

git init
git add .
git commit -m "Initial commit - Smart Campus Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-campus-management-system.git
git push -u origin main
```

---

## STEP 3: Deploy Backend on Render.com (FREE)

1. Go to **https://render.com** → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `smart-campus-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: **Free**

5. Add **Environment Variables** (click "Add Environment Variable"):

   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority` |
   | `DB_NAME` | `smart_campus` |
   | `JWT_SECRET` | `your-random-secret-key-here-make-it-long` |

6. Click **"Create Web Service"**
7. Wait for deployment (3-5 minutes)
8. Your backend URL will be like: `https://smart-campus-api.onrender.com`
9. Test: Open `https://smart-campus-api.onrender.com/` in browser - should show `{"status":"ok"}`

---

## STEP 4: Deploy Frontend on Vercel (FREE)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | `https://smart-campus-api.onrender.com` |

   ⚠️ **IMPORTANT**: URL ke end mein `/` MAT lagana

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Your frontend URL will be like: `https://smart-campus-xxx.vercel.app`

---

## STEP 5: First Time Setup - Seed Data

After both are deployed successfully:

1. Open your frontend URL in browser
2. The backend automatically seeds demo data on first startup
3. If it doesn't work, manually call: `https://YOUR-BACKEND-URL.onrender.com/api/seed` (POST request)

---

## Login Credentials (After Seeding):

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@smartcampus.edu` | `admin123` |
| **Faculty** | `rajesh.kumar@smartcampus.edu` | `faculty123` |
| **Student** | `aarav.mehta@smartcampus.edu` | `student123` |

---

## IMPORTANT NOTES:

### Render Free Tier:
- Server **sleeps** after 15 min of no activity
- First request after sleep takes 30-50 seconds (cold start)
- This is NORMAL for free tier

### MongoDB Atlas Free Tier:
- 512MB storage (enough for demo)
- Shared cluster
- FREE forever

### Vercel Free Tier:
- 100GB bandwidth/month
- Instant deploys
- Custom domain supported
- FREE forever

---

## TROUBLESHOOTING:

### "Network Error" on frontend:
- Check if `REACT_APP_BACKEND_URL` is set correctly in Vercel
- Make sure URL doesn't end with `/`
- Redeploy frontend after changing env vars

### Backend not starting:
- Check Render logs for errors
- Verify `MONGO_URL` is correct
- Make sure MongoDB Atlas allows access from anywhere (0.0.0.0/0)

### Login not working:
- Backend needs to seed data first
- Call `POST https://your-backend.onrender.com/api/seed`
- Wait for backend to fully start (cold start takes 30-50 seconds)

### CORS Error:
- Already fixed in code (`allow_origins=["*"]`)
- If still getting it, check if backend URL is correct

---

## SHARING YOUR APP:

After deployment, share these with anyone:
- **Live URL**: `https://your-app.vercel.app`
- **Login**: `admin@smartcampus.edu` / `admin123`

That's it! Your app is now LIVE and FREE! 🎉
