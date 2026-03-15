# 🚀 Smart Campus Management System - Deployment Guide

## **STEP 1: MongoDB Atlas Setup (Cloud Database)**

### 1.1 MongoDB Account Banao
- `mongodb.com/cloud` par jaao
- "Sign Up" karo (Free)
- Email verify karo

### 1.2 Free Cluster Create Karo
```
1. Dashboard mein "Create a Deployment" karo
2. "Build a Database" select karo
3. Free tier select karo (M0)
4. Provider: AWS, Region: Asia-South1 (Mumbai)
5. Cluster name: "smart-campus"
6. "Create Cluster" karo
```

### 1.3 Connection String Generate Karo
```
1. Cluster dashboard mein jaao
2. "Connect" button daba
3. "Drivers" select karo
4. Connection string copy karo:
   
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

### 1.4 Network Access Add Karo
```
1. "Network Access" tab mein jaao
2. "Add IP Address" 
3. "Allow access from anywhere" (0.0.0.0/0) select karo
4. Confirm karo
```

---

## **STEP 2: Backend Ko Railway Par Deploy Karo**

### 2.1 Railway Account Setup
- `railway.app` par jaao
- GitHub se login karo
- "New Project" karo

### 2.2 GitHub Repo Connect Karo
```
1. "Deploy from GitHub"
2. Apna repo select karo
3. Branch: main
```

### 2.3 Environment Variables Set Karo
```
In Railway Dashboard:
Variables → Add Variable

MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=https://your-vercel-url.vercel.app
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 2.4 Backend Folder Ko Target Karo
```
Settings → Root Directory → /backend
```

### 2.5 Deploy Karo
- Railway automatic deploy kar dega
- Deployment URL milega (note this!)

---

## **STEP 3: Frontend Ko Vercel Par Deploy Karo**

### 3.1 Vercel Account Setup
- `vercel.com` par jaao
- GitHub se login karo
- Dashboard mein "New Project"

### 3.2 GitHub Repo Connect Karo
```
1. "Import Git Repository"
2. Apna repo select karo
```

### 3.3 Framework Select Karo
```
Framework: React
Root Directory: /frontend
```

### 3.4 Environment Variables
```
Environment Variables section mein:

REACT_APP_API_URL=https://your-railway-backend.railway.app
```

### 3.5 Deploy Karo
- Vercel automatic deploy kar dega
- URL milega (e.g., my-app.vercel.app)

---

## **STEP 4: Backend Mein Frontend URL Update Karo**

Railway dashboard mein:

```
CORS_ORIGIN = https://your-vercel-url.vercel.app
```

Redeploy karo.

---

## **Generated URLs (Share Yeh URLs):**

```
Frontend: https://your-app.vercel.app
Backend: https://your-backend.railway.app
```

---

## **Important Files Needed:**

### ✅ Backend Requirements Checked:
- requirements.txt ✓
- server.py ✓
- .env file ✓

### ✅ Frontend Requirements:
- package.json ✓
- .env.local ✓

---

## **Troubleshooting:**

### "CORS Error" ❌
```
Solution:
1. Railway CORS_ORIGIN check karo
2. Vercel URL exact match hona chahiye (https:// include karo)
3. Redeploy karo
```

### "Database Connection Error" ❌
```
Solution:
1. MongoDB connection string verify karo
2. IP whitelist check karo (0.0.0.0/0 hona chahiye)
3. Network connectivity test karo
```

### "API Not Responding" ❌
```
Solution:
1. Railway logs check karo
2. Backend properly deployed hai?
3. Frontend .env update hua?
```

---

## **Success! ✅**

Jab sab kaam ho jaye:
1. Frontend URL testers ko bhej do
2. Woh use kar sakte hain!
3. Database ka data automatically saved hoga

**Final Check:**
```
1. Frontend load hota hai?
2. Login button kaam karta hai?
3. Data save/retrieve hota hai?
4. Kisi aur device se open ho sakta hai?
```

**Done! 🎉 Ab public hai aapka app!**
