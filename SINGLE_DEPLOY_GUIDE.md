# Single Deployment Guide (Monorepo on Vercel)

## ✅ What Changed

Your project now deploys as **ONE Vercel project** with both frontend and backend together.

### File Changes:
1. **Root `vercel.json`** - Configures both client and server
2. **`client/.env.production`** - API URL now uses relative path `/api`
3. **`client/src/utils/api.js`** - Auto-detects production mode

### How It Works:
```
https://purcmiumv1.vercel.app
├── /                    → React app (client/build)
├── /products            → React app (SPA routing)
└── /api/*               → Express backend (server/server.js)
```

## 🚀 Deployment Steps

### Option 1: Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com/dashboard
2. **Import your Git repository**
3. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: **Leave empty** (uses root)
   - Build Command: **Auto-detected** (uses vercel.json)
   - Output Directory: **Auto-detected**
4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_ATLAS_URI=mongodb+srv://offstream9_db_user:CRSEXYADATYA@cluster0.ebglno5.mongodb.net/purcmium
   JWT_SECRET=dda7403369cc9903fa1ef746c32a7dcb98d0a6bbf0fa4142954df443177bf3253eda335db7c7faf0abc9f00711d60a050392e1deecd5aeb48ad5b3cf8beac6a9
   JWT_EXPIRE=7d
   ADMIN_EMAIL=admin@purcmium.com
   ADMIN_PASSWORD=VEWEkdaQvdBO0fEluwJd23VNmzQ=
   FRONTEND_URL=https://purcmiumv1.vercel.app
   CORS_ORIGINS=https://purcmiumv1.vercel.app
   COOKIE_DOMAIN=.vercel.app
   BCRYPT_ROUNDS=12
   ```
5. **Deploy**

### Option 2: Vercel CLI

```bash
# From the root directory
vercel --prod
```

When prompted, add environment variables or add them in the dashboard after deployment.

## 🔧 Environment Variables

Add these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_ATLAS_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Your secure JWT secret |
| `JWT_EXPIRE` | `7d` |
| `ADMIN_EMAIL` | `admin@purcmium.com` |
| `ADMIN_PASSWORD` | Your admin password |
| `FRONTEND_URL` | `https://purcmiumv1.vercel.app` |
| `CORS_ORIGINS` | `https://purcmiumv1.vercel.app` |
| `COOKIE_DOMAIN` | `.vercel.app` |
| `BCRYPT_ROUNDS` | `12` |

## ✅ Benefits of Single Deployment

- ✅ **No CORS issues** - Same origin for frontend and backend
- ✅ **Simpler deployment** - One command, one project
- ✅ **Automatic API routing** - `/api/*` goes to backend
- ✅ **Shared cookies** - Authentication works seamlessly
- ✅ **Single domain** - No need to manage multiple URLs

## 🧪 Testing

After deployment:

1. **Visit**: https://purcmiumv1.vercel.app
2. **Check products load**: Homepage should show products from database
3. **Test admin login**: https://purcmiumv1.vercel.app/admin/login
4. **Check API**: https://purcmiumv1.vercel.app/api/products (should return JSON)

## 🐛 Troubleshooting

### Frontend shows but API fails
- Check environment variables are set in Vercel
- Check MongoDB Atlas allows Vercel IPs (use 0.0.0.0/0 for now)
- Check server logs in Vercel dashboard

### 404 on API routes
- Verify `vercel.json` exists in root
- Check rewrites configuration
- Ensure `server/server.js` exists

### Build fails
- Check both client and server have `package.json`
- Verify `npm install` works locally in both folders
- Check build logs for specific errors

## 🔐 Security Checklist

Before going live:

- [ ] Rotate MongoDB credentials (current ones exposed in conversation)
- [ ] Change admin password to something unique
- [ ] Review CORS_ORIGINS matches your domain exactly
- [ ] Enable MongoDB Atlas IP whitelist (currently open to all)
- [ ] Test all functionality in production

## 📦 Local Development

Nothing changes for local development:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

The frontend will use `http://localhost:5000/api` automatically in development mode.

## 🔄 Redeploying

Every git push to main branch triggers auto-deployment, or:

```bash
vercel --prod
```

That's it! Much simpler than managing two separate deployments.
