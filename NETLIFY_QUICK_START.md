# Netlify + Render Deployment Quick Start

## 🎯 5-Step Deployment Process

### Step 1: Frontend Setup (5 minutes) ⚡

```bash
# 1. Ensure netlify.toml exists in root (✓ Already configured)
# 2. Verify frontend files are in frontend/ folder (✓ Already present)

# Test locally first (optional)
cd frontend
npx http-server -p 3000
# Visit http://localhost:3000
```

### Step 2: Deploy Frontend to Netlify (10 minutes) 🚀

**Option A: GitHub + Netlify (Recommended)**
```bash
# 1. Push your code to GitHub (if not already done)
git add .
git commit -m "Ready for Netlify deployment"
git push origin main

# 2. Go to https://netlify.com
# 3. Click "Add new site" > "Import an existing project"
# 4. Connect GitHub and select your repository
# 5. Build settings:
#    - Build command: (BLANK)
#    - Publish directory: frontend
# 6. Click "Deploy"
```

**Option B: Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
cd frontend
netlify deploy --prod
```

### Step 3: Backend Setup (10 minutes) 🔧

```bash
# 1. Copy current .env to .env.production
cd backend
cp .env .env.production

# 2. Update FRONTEND_URL in .env.production
# Change: FRONTEND_URL=http://localhost:3000
# To: FRONTEND_URL=https://YOUR-NETLIFY-SITE.netlify.app

# 3. Verify all dependencies are installed
npm install

# 4. Test backend locally (optional)
npm start
# Should see: ✓ Server running on http://localhost:5000
```

### Step 4: Deploy Backend to Render (10 minutes) 🎯

```bash
# 1. Go to https://render.com
# 2. Sign up with GitHub
# 3. Click "New +" > "Web Service"
# 4. Connect your GitHub repository
# 5. Fill in:
#    Name: offline-map-backend
#    Environment: Node
#    Build Command: cd backend && npm install
#    Start Command: cd backend && npm start
# 6. Add Environment Variables:
#    Click "Advanced" > "Add Secret File"
#    Upload backend/.env.production
#    OR add variables manually from backend/.env
# 7. Click "Create Web Service"
# 8. Wait for deployment (2-3 minutes)
# 9. Copy your Render URL (e.g., https://offline-map-backend.onrender.com)
```

### Step 5: Connect Frontend to Backend (5 minutes) 🔗

```bash
# 1. Update netlify.toml with your Render backend URL
# Replace in netlify.toml:
#   from = "/api/*"
#   to = "https://offline-map-backend.onrender.com/api/:splat"

# 2. Deploy updated frontend
git add netlify.toml
git commit -m "Update backend URL"
git push

# Netlify will automatically redeploy
```

---

## ✅ Verify Your Deployment

```bash
# Test frontend
curl -I https://YOUR-SITE.netlify.app
# Should return: 200 OK

# Test backend
curl https://YOUR-BACKEND.onrender.com/api/health
# Should return: {"status":"ok","timestamp":"..."}

# Test API integration
curl -X POST https://YOUR-SITE.netlify.app/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude":40.7128,"longitude":-74.0060}'
```

---

## 🎨 Custom Domain (Optional)

### Add custom domain to Netlify
1. Go to https://app.netlify.com
2. Click on your site
3. Domain settings > Add custom domain
4. Update your DNS provider (registrar)
5. Wait for DNS propagation

---

## 📊 Monitor Your Deployment

### Netlify Dashboard
- https://app.netlify.com
- View logs: Deploys > (click deployment) > Logs

### Render Dashboard
- https://dashboard.render.com
- View logs: Web Service > Logs
- Monitor: Metrics tab

---

## 🔧 Troubleshooting

### Issue: Backend URL not working
```bash
# Make sure to update netlify.toml with correct Render URL
# Then redeploy frontend
git add netlify.toml && git commit -m "Fix backend URL" && git push
```

### Issue: CORS errors
```bash
# Check FRONTEND_URL in backend/.env.production
# Should match your Netlify domain exactly
# Update and redeploy backend on Render
```

### Issue: Firebase not connecting
```bash
# Verify FIREBASE_SERVICE_ACCOUNT_KEY is set correctly
# In Render: Settings > Environment > Check secret file
# All variables should be present
```

### Issue: Pages not loading with SPA routing
```bash
# Verify netlify.toml redirects are configured
# [[redirects]]
#   from = "/*"
#   to = "/index.html"
#   status = 200
```

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Frontend URL | `https://YOUR-SITE.netlify.app` |
| Backend URL | `https://YOUR-BACKEND.onrender.com` |
| Frontend Repo | GitHub |
| Backend Repo | Render (from GitHub) |
| Frontend Logs | netlify.com > Deploys |
| Backend Logs | render.com > Web Service > Logs |
| Update Code | Push to GitHub (auto-deploy) |

---

## 📚 Documentation Links

- Netlify Docs: https://docs.netlify.com
- Render Docs: https://render.com/docs
- Firebase Console: https://console.firebase.google.com

---

**Your app is now production-ready! 🎉**

Total deployment time: ~40 minutes (mostly waiting for builds)
