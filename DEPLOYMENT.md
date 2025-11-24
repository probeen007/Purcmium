# 🚀 Purcmium Deployment Guide

This guide covers deploying Purcmium to various cloud platforms for production use.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB database set up (MongoDB Atlas recommended)
- [ ] Environment variables configured
- [ ] Application tested locally
- [ ] Admin account created
- [ ] Domain name ready (optional)

## 🌐 Frontend Deployment (Vercel - Recommended)

### Step 1: Prepare for Deployment
```bash
# Build the client
cd client
npm run build
```

### Step 2: Deploy to Vercel
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from client directory**
   ```bash
   cd client
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `REACT_APP_API_URL=https://your-backend-url.com/api`

### Alternative: Netlify Deployment
1. **Build the project**
   ```bash
   cd client && npm run build
   ```

2. **Deploy build folder**
   - Drag and drop `client/build` folder to Netlify
   - Or connect GitHub repository

3. **Configure redirects**
   Create `client/public/_redirects`:
   ```
   /*    /index.html   200
   ```

## 🔧 Backend Deployment

### Option 1: Railway (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy**
   ```bash
   cd server
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/purcmium
   railway variables set JWT_SECRET=your_production_jwt_secret
   railway variables set NODE_ENV=production
   railway variables set CORS_ORIGINS=https://your-frontend-domain.com
   ```

### Option 2: Render

1. **Connect GitHub Repository**
   - Go to Render Dashboard
   - Connect your GitHub repository
   - Select the `server` directory as root

2. **Configure Build & Start Commands**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   - Add all required environment variables in Render dashboard

### Option 3: DigitalOcean App Platform

1. **Create new app**
   - Connect GitHub repository
   - Select Node.js environment

2. **Configure app spec**
   ```yaml
   name: purcmium-api
   services:
   - name: api
     source_dir: /server
     github:
       repo: your-username/purcmium
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: MONGODB_URI
       value: your_mongodb_uri
     - key: JWT_SECRET
       value: your_jwt_secret
   ```

### Option 4: Heroku

1. **Install Heroku CLI and login**
   ```bash
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   cd server
   heroku create your-app-name
   ```

3. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

## 💾 Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create free cluster

2. **Configure Database**
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for all IPs)
   - Get connection string

3. **Connection String Format**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## 🔐 Production Environment Variables

### Server (.env)
```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/purcmium

# Security
JWT_SECRET=your_super_long_random_production_secret_key_here
NODE_ENV=production

# CORS (your frontend URL)
CORS_ORIGINS=https://your-domain.com

# Server
PORT=5000

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_secure_password
ADMIN_EMAIL=admin@yourdomain.com
```

### Client (.env)
```bash
# API URL (your backend URL)
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## 🚦 Domain & SSL Setup

### Custom Domain
1. **Point domain to deployment**
   - Vercel: Add domain in dashboard
   - Netlify: Configure custom domain
   - Railway: Add custom domain

2. **SSL Certificate**
   - Most platforms provide automatic SSL
   - Ensure HTTPS is enforced

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Purcmium

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: cd client && npm install
      
    - name: Build
      run: cd client && npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Railway
      uses: railway-deploy@v1
      with:
        railway-token: ${{ secrets.RAILWAY_TOKEN }}
        service: purcmium-api
```

## 🧪 Testing Production Deployment

### Health Checks
```bash
# Test API endpoint
curl https://your-api-domain.com/api/products

# Test frontend
curl -I https://your-frontend-domain.com
```

### Admin Access
1. Visit: `https://your-domain.com/webapp/admin`
2. Login with production credentials
3. Verify all admin functions work

## 🔧 Post-Deployment Setup

### 1. Create Admin User
```bash
# SSH into your server or use the admin creation endpoint
curl -X POST https://your-api-domain.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure_password",
    "email": "admin@yourdomain.com"
  }'
```

### 2. Add Sample Products
- Use admin panel to add initial products
- Import products via CSV if you have data

### 3. Configure Analytics
- Set up Google Analytics (optional)
- Configure error tracking (Sentry recommended)

## 📊 Monitoring & Maintenance

### Performance Monitoring
- **Frontend**: Vercel Analytics, Google PageSpeed
- **Backend**: Railway metrics, Render monitoring
- **Database**: MongoDB Atlas monitoring

### Backup Strategy
- **Database**: MongoDB Atlas automatic backups
- **Code**: Git repository with tags
- **Environment**: Document all configurations

### Updates
```bash
# Update dependencies regularly
cd client && npm update
cd server && npm update

# Test thoroughly before deploying
npm run dev
```

## 🚨 Troubleshooting Common Issues

### CORS Errors
- Ensure `CORS_ORIGINS` includes your frontend URL
- Check for trailing slashes in URLs

### Database Connection
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has proper permissions

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

### Performance Issues
- Enable gzip compression
- Implement CDN for static assets
- Optimize images and bundle size

## 🔗 Helpful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

## 💡 Production Tips

1. **Security**: Use strong JWT secrets and rotate them regularly
2. **Performance**: Enable compression and caching
3. **Monitoring**: Set up alerts for downtime and errors
4. **Backup**: Regular database backups and code versioning
5. **Updates**: Keep dependencies updated and test changes
6. **Scaling**: Monitor usage and scale resources as needed

---

🎉 **Congratulations!** Your Purcmium application is now live in production!