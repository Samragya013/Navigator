# Deployment Guide

Complete step-by-step instructions to deploy the Interactive Map application to production.

## 📋 Table of Contents

1. [Frontend Deployment](#frontend-deployment)
2. [Backend Deployment](#backend-deployment)
3. [Environment Setup](#environment-setup)
4. [Custom Domain](#custom-domain)
5. [SSL/HTTPS](#ssl-https)
6. [Troubleshooting](#troubleshooting)

---

## 🎨 Frontend Deployment

### Option 1: Netlify (Recommended)

#### 1. Prepare Frontend

```bash
# No build step needed - pure static files
cd frontend
```

Ensure `map.js` has production URL:

```javascript
const API_BASE_URL = 'https://your-backend-api.com'; // Your backend URL
```

#### 2. Deploy to Netlify

**Method A: Drag & Drop**

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Log in
3. Drag & drop the `frontend` folder
4. Site deployed instantly!

**Method B: GitHub Integration**

1. Push code to GitHub
2. Connect GitHub to Netlify
3. Set build command: (leave empty - no build)
4. Set publish directory: `frontend`
5. Deploy!

**Method C: Netlify CLI**

```bash
# Install CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

#### 3. Configure Netlify

Create `frontend/netlify.toml`:

```toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(self)"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/*.{js,css,woff,woff2}"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Option 2: Vercel

#### 1. Prepare Frontend

Update `frontend/map.js`:

```javascript
const API_BASE_URL = 'https://your-backend-api.com';
```

#### 2. Deploy to Vercel

**Method A: Web Upload**

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Log in
3. Click "New Project"
4. Upload folder or connect GitHub
5. Select `frontend` as root directory
6. Deploy!

**Method B: Vercel CLI**

```bash
# Install CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

#### 3. Configure Vercel

Create `frontend/vercel.json`:

```json
{
  "buildCommand": "",
  "outputDirectory": ".",
  "public": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Option 3: GitHub Pages (Free)

#### 1. Setup

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/offline_map.git
git push -u origin main
```

#### 2. Enable GitHub Pages

1. Go to repository Settings
2. GitHub Pages section
3. Select `main` branch → `/frontend` folder
4. Save

Your site will be at: `https://username.github.io/offline_map`

---

## 🚀 Backend Deployment

### Option 1: Render (Recommended)

#### 1. Prepare Backend

Create `backend/.env.production`:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

FIREBASE_PROJECT_ID=your-id
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email

OPENROUTE_ENABLED=true

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 2. Deploy to Render

1. Push code to GitHub (backend folder)
2. Go to [render.com](https://render.com)
3. Sign up/Log in
4. Click "New +" → Web Service
5. Connect GitHub repository
6. Configure:
   - **Name:** `interactive-map-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Hobby)

7. Add Environment Variables:
   - Copy from `.env.production`
   - Add in Render dashboard

8. Deploy!

#### 3. Get Backend URL

- Render provides URL: `https://interactive-map-api.onrender.com`
- Update frontend `map.js` with this URL

---

### Option 2: Railway

#### 1. Prepare Backend

```bash
# Ensure package.json has:
# "type": "module"
# "start": "node server.js"
```

#### 2. Deploy to Railway

**Method A: Web Dashboard**

1. Go to [railway.app](https://railway.app)
2. Sign up/Log in
3. New Project → Deploy from GitHub
4. Select repository
5. Configure:
   - Root directory: `backend`
   - Start command: `npm start`

**Method B: Railway CLI**

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
cd backend
railway init
railway up
```

#### 3. Add Environment Variables

In Railway dashboard:

```
Variables → Add Variable
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.com
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
OPENROUTE_ENABLED=true
```

---

### Option 3: Heroku (Legacy)

#### 1. Create `Procfile` in backend:

```
web: node server.js
```

#### 2. Deploy

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FIREBASE_PROJECT_ID=your-id
# ... add all variables

# Deploy
git push heroku main
```

---

### Option 4: AWS/DigitalOcean/VPS

#### 1. Connect via SSH

```bash
ssh root@your-server-ip
```

#### 2. Setup Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

#### 3. Deploy Backend

```bash
# Clone repository
git clone https://github.com/username/offline_map.git
cd offline_map/backend

# Install dependencies
npm install --production

# Create .env
cp .env.example .env
# Edit .env with production values
nano .env

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "interactive-map"
pm2 startup
pm2 save
```

#### 4. Setup Nginx (Reverse Proxy)

```bash
# Install Nginx
apt install -y nginx

# Create config
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Test and restart
nginx -t
systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate certificate
certbot certonly --nginx -d your-domain.com

# Auto-renewal
systemctl enable certbot.timer
```

---

## 🔧 Environment Setup

### Frontend Environment Variables

Update `frontend/map.js`:

```javascript
// Development
const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://your-backend-api.com';

// Production Only
const API_BASE_URL = 'https://interactive-map-api.onrender.com';
```

### Backend Environment Variables

`.env` template:

```bash
# Server
NODE_ENV=production
PORT=5000

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Firebase Firestore
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Distance API (choose one)
OPENROUTE_ENABLED=true
OPENROUTE_API_KEY=your-api-key-if-needed

GOOGLE_MAPS_ENABLED=false
GOOGLE_MAPS_API_KEY=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## 🌐 Custom Domain

### Add Custom Domain to Frontend (Netlify)

1. Go to Site Settings
2. Domain management
3. Add custom domain
4. Configure DNS:

```
Type: CNAME
Name: www
Value: your-site.netlify.app
```

Or:

```
Type: A (apex domain)
Name: @
Value: 75.2.60.5  # Netlify IP
```

### Add Custom Domain to Backend (Render)

1. Go to Settings
2. Custom Domains
3. Add Domain
4. Follow DNS setup instructions

---

## 🔐 SSL/HTTPS

### Automatic SSL

Most platforms (Netlify, Vercel, Render) provide free SSL automatically.

### Manual SSL

For self-hosted:

```bash
# Using Certbot (Let's Encrypt)
certbot certonly --standalone -d your-domain.com

# Auto-renewal
certbot renew --dry-run
```

### SSL Testing

```bash
# Check SSL
openssl s_client -connect your-domain.com:443

# Or use online tools
# https://www.sslshopper.com/ssl-checker.html
```

---

## 📊 Monitoring & Logs

### Netlify Logs

```bash
# View deployment logs
netlify log

# Real-time logs
netlify log --stream
```

### Render Logs

1. Dashboard → Service
2. Logs tab
3. View real-time logs

### Backend Logs

```bash
# PM2
pm2 logs interactive-map

# Render/Railway
View in dashboard

# Docker
docker logs container-name
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and running
- [ ] Frontend URL updated in backend CORS
- [ ] Backend URL updated in frontend
- [ ] Environment variables set correctly
- [ ] Firebase Firestore verified
- [ ] Rate limiting enabled
- [ ] HTTPS/SSL working
- [ ] Custom domain configured
- [ ] Error alerts setup
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] API documentation working
- [ ] Health check endpoint responding

---

## 🐛 Troubleshooting

### Frontend Not Loading

```
Error: Backend API not found
Solution: Check API_BASE_URL in map.js
         Check backend is running
         Check CORS configuration
```

### Backend Deployment Failed

```
Error: "npm install failed"
Solution: Check Node.js version (18+)
         Check package.json syntax
         Check internet connection

Error: "Firebase not initialized"
Solution: Check .env variables
         Verify credential format
         Check Firebase Project exists
```

### Slow Performance

```
Solutions:
- Enable gzip compression
- Use CDN for static files
- Optimize map tiles
- Cache API responses
- Monitor server resources
```

### Database Errors

```
Error: "Firestore connection failed"
Solutions:
- Verify credentials
- Check IP whitelist
- Ensure Firestore is enabled
- Check Firebase project billing
```

### Rate Limiting Issues

```
Error: "Too many requests"
Solutions:
- Increase rate limit in .env
- Implement request caching
- Add client-side debouncing
- Use load balancer
```

---

## 🔄 Update & Maintenance

### Update Frontend

```bash
# Netlify/Vercel automatically redeploy on push
git add .
git commit -m "Update frontend"
git push origin main
```

### Update Backend

```bash
# Render/Railway automatically redeploy on push
git add backend/
git commit -m "Update backend"
git push origin main

# Or restart current deployment
pm2 restart interactive-map
```

### Database Cleanup

```bash
# Run cleanup script (monthly)
node cleanup-old-requests.js

# Or use Firestore's built-in TTL (Time To Live)
# Set on collection
```

---

## 📞 Production Contacts

### Support Platforms

- **Netlify Support:** https://netlify.com/support
- **Render Support:** https://render.com/docs
- **Railway Support:** https://railway.app/support
- **Firebase Support:** https://firebase.google.com/support

### Monitoring Tools

- **Uptime Monitoring:** StatusPage.io, Statuskeep
- **Error Tracking:** Sentry, Rollbar
- **Performance:** Datadog, New Relic

---

## 📈 Scaling Considerations

### When to Scale

- Traffic > 1000 requests/day
- Response time > 500ms
- Database size > 1GB

### Scaling Options

1. **Upgrade Tier**
   - Render: Free → Hobby → Starter
   - Railway: Pay-as-you-go

2. **Database Optimization**
   - Add indexes
   - Archive old data
   - Implement caching

3. **Load Balancing**
   - Multiple backend instances
   - Geographic distribution
   - CDN for assets

4. **Microservices**
   - Separate distance API
   - Queue-based processing
   - Caching layer

---

**Last Updated:** March 31, 2026

**For questions or issues, check the main README.md or create an issue on GitHub.**
