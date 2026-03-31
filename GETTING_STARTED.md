# 🚀 Getting Started - Firebase Ready

Your application is fully configured with Firebase! Follow these steps to get running.

## Step 1: Install Dependencies (5 minutes)

```bash
# Install backend dependencies
cd backend
npm install

# At root, install frontend dependencies (if needed)
cd ..
npm install  # Only needed if you added any frontend packages
```

## Step 2: Verify Configuration

```bash
# Check that .env file exists with Firebase credentials
cd backend
cat .env | head -20

# You should see:
# FIREBASE_PROJECT_ID=locationdetector-f20da
# FIREBASE_API_KEY=AIzaSyCNZm9MthLqx0WnGVjrXkNyFIaiwvtnjWs
# etc.
```

- ✅ If you see the credentials → Continue
- ❌ If .env is missing → Contact support

## Step 3: Start the Backend Server

```bash
cd backend
npm run dev

# You should see:
# ✓ Firebase initialized successfully
# ✓ Project: locationdetector-f20da
# ✓ Firestore connected and ready
# ✓ Server running on http://localhost:5000
```

**Wait for all messages to appear** before proceeding.

### Troubleshooting Server Startup

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Kill existing process: `lsof -ti:5000 \| xargs kill -9` |
| Firebase not initializing | Check .env has all FIREBASE_* variables |
| Module not found errors | Run `npm install` again |
| Permission denied on .env | Check file permissions: `chmod 600 .env` |

## Step 4: Start the Frontend

**Open a NEW terminal window**, then:

```bash
# Navigate to frontend directory
cd frontend

# Start a simple HTTP server
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx http-server -p 8000

# Option 3: Using Node.js built-in
node -e "require('http').createServer((q, s) => require('fs').createReadStream(require('path').join('.', decodeURI(q.url))).pipe(s)).listen(8000)" &
```

**Open browser**: http://localhost:8000

You should see:
- 🗺️ Interactive map centered on New York
- 📍 Ability to click map to select location
- ⏱️ Time estimation displayed after clicking

## Step 5: Test API Endpoints

**From a third terminal**, test that everything is working:

```bash
# Test 1: Health Check
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}

# Test 2: Submit Location
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'

# Expected response:
# {"status":"success","request_id":"...","estimated_time":"25 minutes","coordinate":"40.71,-74.01"}

# Test 3: Get Result
curl http://localhost:5000/api/result/REQUEST_ID_FROM_TEST_2

# Expected response:
# {"status":"success","location":"...","estimated_time":"25 minutes",...}
```

✅ If all tests pass, your app is working!

## Step 6: Verify Firestore Is Saving Data

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `locationdetector-f20da`
3. Navigate to: **Firestore Database** → **Data** tab
4. Look for collection: `location_requests`
5. You should see documents with your test submissions

✅ If documents appear, data is being saved correctly!

## Step 7: Test Complete Flow

1. **Open browser**: http://localhost:8000
2. **Click on map** to select a location
3. **View time estimation** displayed on screen
4. **Check Firebase Console** → Should show new entry in `location_requests`

✅ Complete flow is working!

---

## 🎯 System Overview

### Running System
```
User
  ↓
[Frontend - localhost:8000]
  ↓ (HTTP POST /api/location)
[Backend API - localhost:5000]
  ↓
[Firebase Firestore]
  ├─ location_requests collection
  └─ Documents with metadata
```

### Data Flow
1. User clicks map point (lat, lon)
2. Frontend sends to backend: POST `/api/location` with coordinates
3. Backend validates coordinates
4. Backend calculates time using OpenRouteService API
5. Backend stores request in Firestore
6. Backend returns result to frontend
7. Frontend displays time to user
8. Firestore maintains persistent record

---

## 📊 Useful Commands

### Check Server Status
```bash
# Is backend running?
curl -s http://localhost:5000/api/health | jq .

# Is frontend accessible?
curl -s http://localhost:8000 | head -20
```

### View Logs
```bash
# Backend logs appear in terminal where you ran `npm run dev`
# Look for:
# - ✓ Firebase messages
# - 📍 Location requests
# - ⏱️ Time calculations
```

### Stop Services
```bash
# Stop backend
# In backend terminal: Ctrl+C

# Stop frontend
# In frontend terminal: Ctrl+C

# Kill processes by port
lsof -ti:5000 | xargs kill -9  # Backend
lsof -ti:8000 | xargs kill -9  # Frontend
```

### Reset Firestore (WARNING: Deletes all data)
```bash
# Delete specific collection
# Go to Firebase Console → Firestore → Right-click collection → Delete collection

# Or use CLI
firebase firestore:delete location_requests --token YOUR_TOKEN
```

---

## 🔐 Security Reminder

- ✅ Credentials stored in `.env` (never in code)
- ✅ `.env` protected by `.gitignore`
- ✅ Frontend never handles API keys
- ✅ All API calls go through backend
- ✅ Rate limiting protects against abuse

**Never:**
- ❌ Commit `.env` file
- ❌ Share API keys
- ❌ Paste credentials in code
- ❌ Upload to GitHub publicly
- ❌ Share `.env` contents

---

## 📱 Testing Different Locations

Try submitting different coordinates:

| Location | Latitude | Longitude |
|----------|----------|-----------|
| New York | 40.7128 | -74.0060 |
| London | 51.5074 | -0.1278 |
| Tokyo | 35.6762 | 139.6503 |
| Sydney | -33.8688 | 151.2093 |
| Paris | 48.8566 | 2.3522 |

## 📈 Performance Tips

For faster load times:
1. Use optimized backend configuration
2. Minify frontend CSS/JS for production
3. Enable gzip compression in Nginx
4. Cache map tiles locally
5. Use CDN for static assets

Complete production setup → See **DEPLOYMENT.md**

---

## 🐛 Common Issues & Solutions

### "Firebase is not initialized"
```
❌ Problem: .env variables not loaded
✅ Solution: 
- Verify .env exists in backend directory
- Check FIREBASE_PROJECT_ID is set
- Restart backend server
- See FIREBASE_SETUP.md for troubleshooting
```

### "Cannot connect to Firestore"
```
❌ Problem: Wrong credentials or network issue
✅ Solution:
- Check credentials in Firebase Console
- Verify Firebase Project ID matches (locationdetector-f20da)
- Verify internet connection
- Review FIREBASE_SETUP.md troubleshooting section
```

### "Port 5000 in use"
```
❌ Problem: Another app using the port
✅ Solution:
- Kill existing process: lsof -ti:5000 | xargs kill -9
- Or use different port: PORT=5001 npm run dev
```

### "CORS error in browser console"
```
❌ Problem: Frontend URL not in CORS whitelist
✅ Solution:
- Update FRONTEND_URL in backend/.env
- Should be: http://localhost:8000
- Restart backend server
```

### "Rate limit exceeded"
```
❌ Problem: Too many requests in short time
✅ Solution:
- Wait 1 minute before retrying
- Check rate limits in backend/.env
- For production, adjust RATE_LIMIT_MAX_REQUESTS
```

For more help → See **FIREBASE_SETUP.md** troubleshooting section

---

## ✨ Next Steps

- [ ] Verify all tests pass
- [ ] Test with multiple coordinates
- [ ] Check Firestore has data
- [ ] Review security checklist (SECURITY_CHECKLIST.md)
- [ ] Deploy to production (see DEPLOYMENT.md)

---

## 📚 Documentation Reference

- **FIREBASE_SETUP.md** - Complete Firebase configuration guide
- **API_EXAMPLES.md** - API endpoint testing reference
- **DEPLOYMENT.md** - Production deployment instructions
- **SECURITY_CHECKLIST.md** - Security verification checklist
- **README.md** - Full project documentation

---

**Your application is ready! 🎉**

### Quick Start Command
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && python -m http.server 8000

# Then open: http://localhost:8000
```

**Questions?** Check the documentation files above.

**Ready to deploy?** See DEPLOYMENT.md for production setup.
