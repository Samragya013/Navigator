# 🔧 CORS Error Fix & Deployment Guide

## Problem Summary

Your frontend is deployed on **Netlify** but your backend is still running **locally**. Netlify frontend can't access `localhost:5000`.

```
❌ Frontend: https://69cc55fd46b1fb32f6ecb8f0--chimerical-faun-f27217.netlify.app (Netlify)
❌ Backend: http://localhost:5000 (Local - NOT accessible from internet)
❌ Result: CORS error - frontend blocked from calling backend
```

---

## Solution

### Option 1: Local Testing (Quick Fix - for development)

If you want to test locally:

**Step 1: Restart Backend**
```bash
cd backend
npm run dev
```

**Step 2: Update Frontend (ALREADY DONE)**
The frontend now auto-detects environment and uses:
- `http://localhost:5000/api` for local
- Production URL for deployed Netlify

**Step 3: Run Frontend Locally**
```bash
cd frontend
python -m http.server 3000
# Or
npx http-server -p 3000
```

**Open**: `http://localhost:3000`

✅ Works locally - CORS fixed

---

### Option 2: Production Deployment (Recommended)

To deploy frontend and backend together, you need to deploy the **backend to a production server**.

#### Step 1: Deploy Backend to Production

Choose one of these platforms:

##### **RENDER (Recommended - Free)**

1. Create Render account: https://render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Configure:
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm run dev`
5. Add Environment Variables:
   ```
   FIREBASE_PROJECT_ID=locationdetector-f20da
   FIREBASE_API_KEY=AIzaSyCNZm9MthLqx0WnGVjrXkNyFIaiwvtnjWs
   FIREBASE_AUTH_DOMAIN=locationdetector-f20da.firebaseapp.com
   FIREBASE_STORAGE_BUCKET=locationdetector-f20da.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=983896801932
   FIREBASE_APP_ID=1:983896801932:web:383eed8062e46a3c7c31a9
   FRONTEND_URL=https://your-netlify-domain.netlify.app
   ```
6. Deploy
7. Note your URL: `https://your-app.onrender.com`

##### **RAILWAY (Alternative)**

1. Create Railway account: https://railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Add environment variables (same as above)
5. Railway assigns URL automatically

##### **VERCEL (Alternative)**

```bash
npm i -g vercel

cd backend
vercel deploy --prod
```

---

#### Step 2: Update Netlify Configuration

Once backend is deployed, update `netlify.toml`:

```toml
[context.production.environment]
  NODE_ENV = "production"
  REACT_APP_API_URL = "https://your-backend.onrender.com"
  VITE_API_URL = "https://your-backend.onrender.com"
```

---

#### Step 3: Update Frontend Code

Update API URL in frontend files to use production URL:

In `frontend/index.html` (around line 561):
```javascript
const API_BASE_URL = window.location.hostname.includes('netlify.app')
    ? 'https://your-backend.onrender.com/api'  // Production backend
    : 'http://localhost:5000/api';               // Local development
```

In `frontend/smart-navigation.html` (around line 540):
```javascript
const API_BASE_URL = window.location.hostname.includes('netlify.app')
    ? 'https://your-backend.onrender.com/api'  // Production backend
    : 'http://localhost:5000/api';               // Local development
```

---

#### Step 4: Update Backend .env

In `backend/.env`:
```env
FRONTEND_URL=https://your-netlify-domain.netlify.app
NETLIFY_URL=https://your-netlify-domain.netlify.app
```

---

#### Step 5: Deploy Frontend

1. Push changes to GitHub
2. Netlify auto-deploys (watch deployment in Netlify dashboard)
3. Wait for deployment to complete
4. Test the application

---

## Testing CORS Fix

### Local Test
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
python -m http.server 3000

# Browser: http://localhost:3000
# Should work without CORS errors
```

### Production Test
1. Open your Netlify URL in browser
2. Try entering an address in the origin/destination fields
3. Check browser console (F12 → Console tab)
4. Should NOT see CORS errors

---

## CORS Configuration Changes Made

### Backend (`server.js`)
```javascript
// Now accepts:
// ✓ http://localhost:3000 (local dev)
// ✓ http://localhost:8000 (alternative local)
// ✓ Any *.netlify.app domain (production)
// ✓ Any *.vercel.app domain
// ✓ Custom FRONTEND_URL from env
```

### Frontend Environment Detection
```javascript
// Automatically uses:
// - http://localhost:5000 if running on localhost
// - Production URL if running on netlify.app
```

---

## Troubleshooting

### Still Getting CORS Error?

1. **Check backend is running**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Check .env variables**
   ```bash
   # Local backend
   echo $FRONTEND_URL
   # Should show your Netlify URL
   ```

3. **Clear browser cache**
   - Open DevTools: F12
   - Network tab → Disable cache (checkbox)
   - Refresh page

4. **Check browser console**
   - Open DevTools: F12 → Console
   - Look for CORS error details
   - Verify URL matches

### Backend Deployment Issues?

- Check Render/Railway logs for errors
- Verify all environment variables are set
- Confirm Firebase credentials are correct
- Check that backend is listening on correct port

### Frontend Not Updating?

- Push to GitHub (auto-triggers Netlify deploy)
- Check Netlify deployment logs
- Clear browser cache (Ctrl+Shift+Delete)
- Give deployment 2-3 minutes to complete

---

## API Endpoints Available

Once backend is deployed, these endpoints work:

```bash
# Route calculation
POST /api/route
{
  "origin": "40.7128,-74.0060",
  "destination": "40.7580,-73.9855"
}

# Address lookup
POST /api/address
{"query": "New York"}

# Pincode lookup
POST /api/pincode
{"pincode": "10001"}

# Reverse geocoding
POST /api/geocode/reverse
{"latitude": 40.7128, "longitude": -74.0060}

# Health check
GET /api/health

# Get trips
GET /api/trips

# Trip statistics
GET /api/trips/stats
```

---

## Production Checklist

- [ ] Backend deployed to production server
- [ ] Environment variables set on server
- [ ] Firebase credentials configured
- [ ] CORS allows Netlify domain
- [ ] Frontend API URL updated to production backend
- [ ] netlify.toml updated with backend URL
- [ ] Frontend deployed to Netlify
- [ ] API endpoints tested
- [ ] No CORS errors in browser console
- [ ] Application fully functional

---

## Quick Deploy Command

### If using GitHub + Render:

```bash
# 1. Commit and push
git add .
git commit -m "Fix CORS configuration"
git push origin main

# 2. Render auto-deploys from GitHub
# 3. Once backend deployed, update netlify.toml
# 4. Push again
git add netlify.toml
git commit -m "Update backend URL"
git push origin main

# 5. Netlify auto-deploys frontend
```

---

## Current Status

✅ Local Testing Works:
- Backend: `npm run dev` on localhost:5000
- Frontend: Can connect locally

❌ Production Issue:
- Frontend deployed on Netlify
- Backend still local (not accessible)
- Need to deploy backend to production

---

## Next Steps

1. **Choose deployment platform** (Render recommended)
2. **Deploy backend** to production
3. **Update netlify.toml** with backend URL
4. **Update frontend** API URLs
5. **Test application** on Netlify
6. **Verify no CORS errors** in browser

---

## Support

If CORS errors persist:
1. Check browser console for exact error
2. Verify backend is responding: `curl backend-url/api/health`
3. Verify frontend URL matches CORS config
4. Check server logs for details

Happy deploying! 🚀
