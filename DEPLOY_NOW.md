# 🚀 FINAL DEPLOYMENT GUIDE - TWO PROJECTS

## Current Status
✅ Frontend repo ready - will deploy to: https://purcmium.vercel.app
⏳ Backend needs deployment - create as NEW project

---

## STEP 1: Deploy Backend (5 minutes)

### 1.1 Create New Vercel Project
1. Go to: https://vercel.com/new
2. Select your GitHub repo: `probeen007/Purcmium`
3. Click "Import"

### 1.2 Configure Backend Project
**Project Name**: `purcmium-backend` (or any name you want)

**Framework Preset**: Other

**Root Directory**: `server` ← **CLICK "Edit" AND TYPE "server"**

**Build Command**: (leave empty)

**Output Directory**: (leave empty)

**Install Command**: (leave empty - auto-detected)

### 1.3 Add Environment Variables
Click "Environment Variables" and add these **ONE BY ONE**:

```
NODE_ENV=production
```

```
MONGODB_ATLAS_URI=mongodb+srv://offstream9_db_user:CRSEXYADATYA@cluster0.ebglno5.mongodb.net/purcmium
```

```
JWT_SECRET=dda7403369cc9903fa1ef746c32a7dcb98d0a6bbf0fa4142954df443177bf3253eda335db7c7faf0abc9f00711d60a050392e1deecd5aeb48ad5b3cf8beac6a9
```

```
JWT_EXPIRE=7d
```

```
ADMIN_EMAIL=admin@purcmium.com
```

```
ADMIN_PASSWORD=VEWEkdaQvdBO0fEluwJd23VNmzQ=
```

```
FRONTEND_URL=https://purcmium.vercel.app
```

```
CORS_ORIGINS=https://purcmium.vercel.app
```

```
COOKIE_DOMAIN=.vercel.app
```

```
BCRYPT_ROUNDS=12
```

### 1.4 Deploy
Click "Deploy" button

Wait 2-3 minutes...

✅ **COPY YOUR BACKEND URL** (will be something like `https://purcmium-backend-xyz.vercel.app`)

### 1.5 Test Backend
Visit: `https://your-backend-url.vercel.app/api/products`

Should see JSON response with products (or empty array if no products yet)

---

## STEP 2: Connect Frontend to Backend (2 minutes)

### 2.1 Add Backend URL to Frontend
1. Go to: https://vercel.com/dashboard
2. Click on your **frontend project** (purcmium)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. **Name**: `REACT_APP_API_URL`
6. **Value**: `https://your-backend-url.vercel.app/api` (replace with your URL from Step 1.4)
7. Select **Production, Preview, Development** (all three)
8. Click **Save**

### 2.2 Redeploy Frontend
1. Go to **Deployments** tab
2. Click the three dots ⋯ on the latest deployment
3. Click **Redeploy**
4. Click **Redeploy** again to confirm

Wait 1-2 minutes...

---

## STEP 3: Verify Everything Works

### 3.1 Test Backend API
```
https://your-backend-url.vercel.app/api/products
https://your-backend-url.vercel.app/api/health
```
Should return JSON ✅

### 3.2 Test Frontend
Visit: https://purcmium.vercel.app

- ✅ Should load React app
- ✅ Should load products from database
- ✅ Admin login should work at `/admin/login`

---

## Troubleshooting

### Backend shows 500 error
- Check Vercel function logs: Dashboard → Backend project → Functions
- Likely MongoDB connection issue
- Verify `MONGODB_ATLAS_URI` is correct
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Frontend shows "No products found"
- Open browser console (F12)
- Check Network tab for failed API calls
- Verify `REACT_APP_API_URL` is set correctly in frontend project
- Test backend URL directly in browser

### CORS errors in console
- Go to backend project → Settings → Environment Variables
- Update `CORS_ORIGINS` to match your exact frontend URL
- Update `FRONTEND_URL` to match your exact frontend URL
- Redeploy backend

---

## Environment Variables Summary

### Backend Environment Variables (10 total):
- NODE_ENV
- MONGODB_ATLAS_URI
- JWT_SECRET
- JWT_EXPIRE
- ADMIN_EMAIL
- ADMIN_PASSWORD
- FRONTEND_URL
- CORS_ORIGINS
- COOKIE_DOMAIN
- BCRYPT_ROUNDS

### Frontend Environment Variables (1 required):
- REACT_APP_API_URL (points to backend)

---

## Final URLs

After deployment:
- **Frontend**: https://purcmium.vercel.app
- **Backend**: https://your-backend-name.vercel.app
- **API Endpoint**: https://your-backend-name.vercel.app/api

---

## Security Reminder

⚠️ **BEFORE GOING LIVE:**
1. Change MongoDB password (current one is exposed)
2. Create new MongoDB user in Atlas
3. Update `MONGODB_ATLAS_URI` in backend
4. Redeploy backend

---

## Success Checklist

- [ ] Backend deployed and accessible
- [ ] Backend API returns JSON at `/api/products`
- [ ] Frontend environment variable added
- [ ] Frontend redeployed
- [ ] Products load on frontend
- [ ] Admin login works
- [ ] No console errors

---

You're done! 🎉
