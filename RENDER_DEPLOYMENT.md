# 🚀 RENDER.COM DEPLOYMENT GUIDE

Complete step-by-step guide for deploying the Navigator application on Render.com

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Configuration & Environment](#configuration--environment)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Before You Start
1. **GitHub Account** - Push your code to GitHub
2. **Render.com Account** - Sign up at [render.com](https://render.com)
3. **Git** - Installed locally
4. **Node.js** - 18.18.0+ (project uses .nvmrc)

### Prepare Your Repository
```bash
# Ensure all code is committed
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## Backend Deployment

### Step 1: Create Backend Web Service

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Authenticate with GitHub
   - Select your Navigator repository
   - Click "Connect"

3. **Configure Web Service**
   - **Name**: `navigator-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Build Command**: `cd backend && npm install --production`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (for testing)

4. **Set Environment Variables** (Click "Advanced")
   ```
   NODE_ENV = production
   PORT = 10000
   OPENROUTE_ENABLED = true
   RATE_LIMIT_WINDOW_MS = 900000
   RATE_LIMIT_MAX_REQUESTS = 100
   LOG_LEVEL = info
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (2-5 minutes)
   - Note your backend URL: `https://navigator-backend.onrender.com`

### Step 2: Link Frontend to Backend

After backend is deployed, copy the backend URL for frontend configuration.

---

## Frontend Deployment

### Option A: Static Site (Recommended for Free Tier)

1. **Create Static Site**
   - Return to Render Dashboard
   - Click "New +" → "Static Site"

2. **Connect Repository**
   - Select same GitHub repository
   - Click "Connect"

3. **Configure Static Site**
   - **Name**: `navigator-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Build Command**: `echo "Frontend ready"`
   - **Publish Directory**: `frontend`

4. **Deploy Static Site**
   - Click "Create Static Site"
   - Wait for deployment (1-2 minutes)
   - Get frontend URL: `https://navigator-frontend.onrender.com`

5. **Configure API Endpoint**
   - Your frontend's `map.js` will automatically detect:
     - Development: `http://localhost:5000`
     - Render deployment: `https://navigator-backend.onrender.com`

### Option B: Web Service (If Using Node Backend for Frontend)

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select repository

2. **Configure**
   - **Name**: `navigator-frontend`
   - **Environment**: `Node` or `Docker`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `npm start`

---

## Configuration & Environment

### Current Configuration

The application is pre-configured with:

✅ **Automatic URL Detection**
- Development: Uses `localhost:5000`
- Render: Uses service URLs
- Production: Uses environment variables

✅ **CORS Enabled**
- Supports Render domains
- Supports Netlify deployments
- Localhost development

✅ **Rate Limiting**
- 100 requests per 15 minutes
- Configurable via env vars

✅ **Free Tier & No External Services**
- Uses OpenRouteService (free, no API key needed)
- No Firebase required (optional)
- No paid external APIs

### Optional Features

#### Enable Firebase (Advanced)
If you want to store trip data in Firestore:

1. Create Firebase project at [firebase.google.com](https://firebase.google.com)
2. Generate service account key
3. Add these env vars to backend:
   ```
   FIREBASE_PROJECT_ID = your-project-id
   FIREBASE_SERVICE_ACCOUNT_KEY = {paste JSON}
   FIREBASE_PRIVATE_KEY = your-private-key
   FIREBASE_CLIENT_EMAIL = your-service-account-email
   ```

#### Enable Google Maps (Advanced)
For enhanced routing:

1. Get API key from Google Cloud Console
2. Add to backend:
   ```
   GOOGLE_MAPS_ENABLED = true
   GOOGLE_MAPS_API_KEY = your-key
   ```

---

## Verification

### Test Backend

```bash
# Health check
curl https://navigator-backend.onrender.com/api/health

# API root
curl https://navigator-backend.onrender.com/api

# Backend logs
# View in Render Dashboard → Logs
```

### Test Frontend

1. Open frontend URL in browser
2. Verify map loads
3. Test features:
   - ✓ Map loads with current location
   - ✓ Click to select location
   - ✓ Button clicks work
   - ✓ No console errors
   - ✓ Mobile responsive

### Test Full Integration

1. Open frontend: `https://navigator-frontend.onrender.com`
2. Click on map to select a location
3. Verify API calls reach backend
4. Check browser console for errors

---

## Troubleshooting

### Issue: "Build Failed"

**Solution:**
```bash
# Check Render logs for specific error
# Common fixes:
1. Ensure package-lock.json is in repo
2. Check Node dependencies install correctly locally
3. Verify build script in package.json
```

### Issue: "CORS Error"

**Solution:**
- Backend CORS is configured for Render domains
- If error persists:
  1. Check backend logs in Render Dashboard
  2. Verify FRONTEND_URL is set correctly
  3. Ensure frontend URL is registered in CORS allowlist

### Issue: "API Not Responding"

**Solution:**
```bash
# Test backend directly
curl https://navigator-backend.onrender.com/api/health

# If fails:
1. Check backend deployment logs
2. Verify PORT is set to 10000
3. Ensure health check passes
4. Restart service from Render Dashboard
```

### Issue: "Map Not Loading"

**Solution:**
1. Check browser console for JS errors
2. Verify Leaflet CDN is accessible
3. Check CORS headers being returned
4. Inspect Network tab for blocked requests

### Issue: "Free Tier Sleeping"

**Important:** Free tier services sleep after 15 minutes of inactivity.
- First request after sleep takes 30-40 seconds
- Solutions:
  - Use Paid plan ($7/month minimum)
  - Setup uptime monitoring to keep service awake
  - Accept startup delay for free tier

---

## Monitoring & Logs

### View Logs in Render

1. Go to Render Dashboard
2. Select your service (backend or frontend)
3. Click "Logs" tab
4. Monitor real-time activity

### Common Log Patterns

```
✓ GET /api/health - 200 (5ms)              // Healthy
✓ POST /api/location - 200 (150ms)         // Location calculation
✗ POST /api/location - 400 (10ms)          // Invalid input
⚠️  Socket hang up                           // Connection timeout
```

---

## Performance Optimization

### For Free Tier
- Keep instance small
- Optimize API calls
- Cache responses where possible
- Monitor memory usage

### Scaling Options
- Upgrade from Free to Paid ($7/month)
- Deploy to other regions for faster response
- Enable CDN for frontend static assets
- Use database for caching

---

## Security Considerations

✅ Production Setup
- HTTPS enabled automatically
- CORS properly configured
- Rate limiting enabled
- Helmet security headers
- Input validation

⚠️ Before Production
- Update API keys/secrets
- Control allowed origins strictly
- Monitor rate limit thresholds
- Setup error monitoring
- Enable audit logging

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Server Logs**: Render Dashboard → Logs
- **GitHub Issues**: Report in repository
- **Status Page**: https://status.render.com

---

## Quick Reference

### URLs After Deployment
- Frontend: `https://navigator-frontend.onrender.com`
- Backend: `https://navigator-backend.onrender.com`
- API Health: `https://navigator-backend.onrender.com/api/health`

### Common Commands
```bash
# Redeploy from Render Dashboard
# Click "Manual Deploy" → "Deploy latest commit"

# View deployment status
# Dashboard → Select service → "Deployments" tab

# Update environment variables
# Dashboard → Select service → "Environment" tab

# Check service health
# Dashboard → Select service → "Health" indicator
```

---

**Deployment Complete! 🎉**

Your Navigator application is now live on Render.com with:
- ✅ Interactive map interface
- ✅ Real-time location detection
- ✅ Time estimation calculations
- ✅ Responsive design
- ✅ Production security
- ✅ Automatic HTTPS
- ✅ Global CDN

Start using your application at your deployment URLs!
