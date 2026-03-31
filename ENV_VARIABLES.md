# ========================================
# ENVIRONMENT VARIABLES DOCUMENTATION
# ========================================

## Backend Environment Variables

### Required Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Set to "production" for Render |
| `PORT` | 5000 | Render requires 10000 for web services |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_URL` | http://localhost:3000 | Frontend domain for CORS |
| `OPENROUTE_ENABLED` | true | Enable OpenRouteService (free) |
| `GOOGLE_MAPS_ENABLED` | false | Enable Google Maps (paid) |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `LOG_LEVEL` | debug | Logging verbosity |

### Firebase Configuration (Optional)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### Google Maps (Optional)

```env
GOOGLE_MAPS_ENABLED=true
GOOGLE_MAPS_API_KEY=your-api-key
```

---

## Render.com Environment Setup

### For Backend Web Service

Add these variables in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://navigator-frontend.onrender.com
OPENROUTE_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Automatic Variables (Set by Render)

- `RENDER=true` - Indicates running on Render
- `RENDER_EXTERNAL_HOSTNAME` - Your service hostname
- `RENDER_INTERNAL_HOSTNAME` - Internal service name

---

## Development Setup

### Create `.env` file in backend:

```bash
cp backend/.env.example backend/.env
```

Then edit with your local values:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
OPENROUTE_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
```

---

## Security Best Practices

✅ **DO:**
- Use environment variables for all secrets
- Never commit .env files
- Use strong API keys
- Rotate credentials regularly
- Use HTTPS in production

❌ **DON'T:**
- Hardcode credentials in code
- Commit .env files to git
- Share environment files
- Use development keys in production
- Log sensitive data

---

## Changing Environment Variables

### For Local Development

Edit `backend/.env` and restart:
```bash
cd backend
npm run dev
```

### For Render Deployment

1. Go to Render Dashboard
2. Select your backend service
3. Click "Environment" tab
4. Edit variables
5. Click "Save"
6. Service auto-redeploys

---

## Troubleshooting Environment Issues

### "Cannot find module" errors
→ Missing dependencies - run `npm install`

### "CORS error"
→ Check FRONTEND_URL is set correctly

### "API not responding"
→ Verify PORT environment variable

### "Rate limiting too strict"
→ Increase RATE_LIMIT_MAX_REQUESTS

### "No geolocation found"
→ Check browser permissions for geolocation

---

## Environment Variable Validation

The application validates on startup:

```javascript
✓ Checking required variables
✓ Validating Port number
✓ Checking CORS configuration
✓ Validating rate limiting values
✓ Firebase configuration (if provided)
```

Any missing critical variables will show warnings in logs.

---

## Production Environment Checklist

- [ ] NODE_ENV=production
- [ ] PORT=10000 (for Render)
- [ ] FRONTEND_URL set correctly
- [ ] Rate limiting values set
- [ ] Logging level set to 'info'
- [ ] Optional services configured (if needed)
- [ ] No sensitive data in logs
- [ ] CORS properly configured

---

For more details, see:
- RENDER_DEPLOYMENT.md - Deployment guide
- PRODUCTION_CHECKLIST.md - Pre-deployment checklist
- backend/.env.example - Backend template
