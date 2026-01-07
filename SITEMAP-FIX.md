# Fix Sitemap Access on www.purcmium.com

## Problem
Sitemap is on backend (purcmium-backend.vercel.app) but needs to be accessible on frontend domain (www.purcmium.com/sitemap.xml)

## Solution
Added Vercel rewrite to proxy sitemap.xml from backend to frontend domain.

## Files Changed
1. ✅ `client/vercel.json` - Added rewrite rule to proxy /sitemap.xml to backend

## How It Works
```
User visits: https://www.purcmium.com/sitemap.xml
     ↓
Vercel rewrites to: https://purcmium-backend.vercel.app/sitemap.xml
     ↓
Returns: Dynamic XML sitemap from backend
```

## Deployment Steps

### 1. Push Changes to Git
```bash
cd "d:\Professional\CR Project\purcmium"
git add client/vercel.json
git commit -m "Add sitemap proxy for frontend domain"
git push
```

### 2. Vercel Auto-Deploys
- Frontend deploys with new vercel.json
- Rewrite rule activates automatically

### 3. Test After Deployment
```bash
# Should now work!
Visit: https://www.purcmium.com/sitemap.xml
Visit: https://purcmium.com/sitemap.xml

# Backend still works too
Visit: https://purcmium-backend.vercel.app/sitemap.xml
```

## Alternative: Test Locally

### Test Backend Sitemap
```bash
cd server
npm start
# Visit: http://localhost:5000/sitemap.xml
```

### Test Frontend Proxy (after deployment)
```bash
# Will only work after deployed to Vercel
# Local dev server doesn't use vercel.json rewrites
```

## Verification

### ✅ After Deployment, Check:

1. **Sitemap on main domain:**
   ```
   https://www.purcmium.com/sitemap.xml
   Should show: XML with all products
   ```

2. **Sitemap on non-www domain:**
   ```
   https://purcmium.com/sitemap.xml
   Should show: XML with all products
   ```

3. **Robots.txt reference:**
   ```
   https://www.purcmium.com/robots.txt
   Should contain: Sitemap: https://purcmium.com/sitemap.xml
   ```

4. **Backend still accessible:**
   ```
   https://purcmium-backend.vercel.app/sitemap.xml
   Should show: XML with all products
   ```

## What Was Added

### client/vercel.json
```json
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "https://purcmium-backend.vercel.app/sitemap.xml"
    }
  ],
  "headers": [
    {
      "source": "/sitemap.xml",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/xml"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

## Why This Works

1. **Frontend Domain** (www.purcmium.com)
   - Receives request for /sitemap.xml
   - Vercel rewrite proxies to backend
   - Returns backend's dynamic sitemap
   - User sees it as coming from www.purcmium.com

2. **SEO Benefits:**
   - Sitemap URL matches domain in robots.txt
   - Search engines find sitemap easily
   - All URLs in sitemap match frontend domain

3. **Backend Independence:**
   - Backend still generates sitemap dynamically
   - Frontend just proxies the request
   - No duplication of logic

## Troubleshooting

### If sitemap still doesn't work after deployment:

1. **Check Vercel Deployment Logs:**
   - Go to Vercel Dashboard
   - Check frontend deployment
   - Verify vercel.json was included

2. **Clear Cache:**
   ```bash
   https://www.purcmium.com/sitemap.xml?nocache=1
   ```

3. **Check Backend Works:**
   ```bash
   https://purcmium-backend.vercel.app/sitemap.xml
   If this doesn't work, backend issue
   If this works, rewrite issue
   ```

4. **Verify vercel.json Deployed:**
   - Check Vercel dashboard → Deployments
   - Look at deployment files
   - Confirm client/vercel.json is present

## Current Status

- ✅ Backend sitemap working: `server/routes/sitemap.js`
- ✅ Backend route configured: `server/server.js`
- ✅ Frontend proxy created: `client/vercel.json`
- 📝 **NEEDS DEPLOYMENT** to work on production

## Next Steps

1. **Commit and push changes**
2. **Wait for Vercel auto-deployment** (2-3 minutes)
3. **Test:** https://www.purcmium.com/sitemap.xml
4. **Submit to Google Search Console**

---

**Expected Result After Deployment:**
```
✅ https://www.purcmium.com/sitemap.xml → Works!
✅ https://purcmium.com/sitemap.xml → Works!
✅ https://purcmium-backend.vercel.app/sitemap.xml → Works!
```
