# Vercel Deployment Guide

## Project Structure
```
purcmium/
├── client/          # Frontend (React app)
├── server/          # Backend (Express API)
└── package.json     # Root package.json (for local dev only)
```

## Deployment Instructions

### Frontend Deployment (React App)

#### Option 1: Deploy via Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and create new project
2. Import your GitHub repository
3. **Configure Project Settings:**
   - **Framework Preset**: Create React App
   - **Root Directory**: `client` ← **IMPORTANT!**
   - **Build Command**: (leave empty, auto-detected as `npm run build`)
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
4. Click "Deploy"

#### Option 2: Deploy via Vercel CLI
```bash
# From the CLIENT directory
cd client
vercel --prod

# OR from root directory with specific path
vercel --cwd client --prod
```

### Backend Deployment (Express API)

#### Deploy Backend Separately
1. Create a new Vercel project for the backend
2. **Configure Project Settings:**
   - **Framework Preset**: Other
   - **Root Directory**: `server` ← **IMPORTANT!**
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
3. **Add Environment Variables** in Vercel Dashboard:
   ```
   NODE_ENV=production
   MONGODB_ATLAS_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   CORS_ORIGINS=https://your-frontend.vercel.app
   COOKIE_DOMAIN=.vercel.app
   ADMIN_EMAIL=admin@purcmium.com
   ADMIN_PASSWORD=your_secure_password
   BCRYPT_ROUNDS=12
   ```
4. Click "Deploy"

### After Deployment

1. **Update Frontend API URL**:
   - Go to frontend Vercel project
   - Add environment variable:
     ```
     REACT_APP_API_URL=https://your-backend.vercel.app
     ```
   - Redeploy frontend

2. **Update CORS in Backend**:
   - The backend `.env` CORS_ORIGINS should include your frontend URL
   - This is set via Vercel environment variables

3. **Test the Deployment**:
   - Visit your frontend URL
   - Try logging in to admin panel
   - Check if products load correctly

## Troubleshooting

### Error: "react-scripts: command not found"
**Cause**: Vercel is trying to build from root directory instead of client directory

**Solution**: Set **Root Directory** to `client` in Vercel project settings

### Error: "Cannot find module 'express'"
**Cause**: Backend is missing node_modules

**Solution**: Vercel auto-installs dependencies. Check `server/package.json` exists and is valid

### CORS Errors
**Cause**: Backend CORS_ORIGINS doesn't include frontend URL

**Solution**: 
1. Go to backend Vercel project settings
2. Add/update `CORS_ORIGINS` environment variable with frontend URL
3. Redeploy backend

### Cookie/Auth Issues
**Cause**: Cookie domain not set correctly

**Solution**:
1. Set `COOKIE_DOMAIN=.vercel.app` in backend environment variables
2. Ensure `sameSite` is set to `none` for production
3. Frontend must use HTTPS (Vercel provides this automatically)

## Important Notes

- ⚠️ **Change MongoDB credentials** before deploying (current ones in .env are exposed)
- ⚠️ **Use strong admin password** in production
- Each deployment (frontend/backend) needs its own Vercel project
- Free tier: 512MB RAM, 10s timeout per request
- Environment variables are set in Vercel Dashboard, not in code

## Quick Deploy Commands

```bash
# Deploy frontend only
cd client && vercel --prod

# Deploy backend only  
cd server && vercel --prod

# Deploy both (run separately)
cd client && vercel --prod && cd ../server && vercel --prod
```
