# Smart Map-Based Navigation & Time Estimation System
# Complete Setup & Deployment Guide

## Table of Contents
1. [Project Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation)
5. [Configuration](#configuration)
6. [Running Locally](#running-locally)
7. [API Endpoints](#api-endpoints)
8. [Deployment Guide](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a production-ready Smart Vehicle Navigation System that provides:
- ✅ Interactive map with Leaflet.js (OpenStreetMap)
- ✅ Real-time location detection
- ✅ Route calculation with distance & ETA
- ✅ Trip storage in Firebase Firestore
- ✅ Modern UI with light map theme
- ✅ Fully free & open-source tech stack

**Key Features:**
- Click on map to select destination
- Distance and time estimation
- Voice feedback using Web Speech API
- Trip history & analytics
- Responsive design
- Production-ready security

---

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern, responsive styling
- **Vanilla JavaScript** - No frameworks
- **Leaflet.js** - Map rendering
- **OpenStreetMap** - Map tiles (free)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client
- **express-validator** - Input validation

### External APIs (All FREE!)
- **OpenRouteService** - Route calculation & distance/ETA
- **Nominatim** - Address geocoding/reverse geocoding
- **OpenStreetMap** - Map tiles

### Database
- **Firebase Firestore** - Free tier (document storage)

### Deployment
- **Frontend:** Vercel, Netlify, Firebase Hosting
- **Backend:** Render, Railway, Heroku

---

## Prerequisites

Before you start, ensure you have:

1. **Node.js** (v14+)
   ```
   Download from: https://nodejs.org/
   ```

2. **npm** or **yarn** (comes with Node.js)
   ```
   npm --version
   ```

3. **Git** (for version control)
   ```
   Download from: https://git-scm.com/
   ```

4. **Firebase Account** (free tier)
   ```
   Sign up: https://firebase.google.com/
   ```

5. **Text Editor** (VSCode recommended)
   ```
   Download: https://code.visualstudio.com/
   ```

---

## Installation

### Step 1: Navigate to Project Directory
```bash
cd offline_map
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

**Required packages:**
- `express` - Web framework
- `cors` - Cross-origin requests
- `helmet` - Security headers
- `dotenv` - Environment variables
- `firebase-admin` - Firebase SDK
- `express-validator` - Input validation
- `axios` - HTTP requests

### Step 3: Install Frontend Dependencies
Frontend uses CDN libraries (no npm install needed!)
- Leaflet.js (map library)
- OpenStreetMap tiles (free layer)
- Web APIs (built-in browser APIs)

---

## Configuration

### Step 1: Create `.env` File
In `backend/` directory, create `.env`:

```ini
# ========== SERVER CONFIGURATION ==========
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# ========== FIREBASE CONFIGURATION ==========
FIREBASE_PROJECT_ID=locationdetector-f20da
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# ========== API KEYS (Optional - Free APIs don't require keys) ==========
OPENROUTE_API_KEY=  # Leave empty for free tier

# ========== RATE LIMITING ==========
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `locationdetector-f20da`
3. Go to **Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the entire JSON
6. Paste into `.env` as `FIREBASE_SERVICE_ACCOUNT_KEY`

### Step 3: Frontend Configuration
Edit `frontend/smart-navigation.html`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';  // Update this URL
const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.0060 };  // NYC default
```

---

## Running Locally

### Option 1: Run Backend Only
```bash
cd backend
npm start      # Production mode
# or
npm run dev   # Development mode (with nodemon)
```

**Expected Output:**
```
🚀 Server running on http://localhost:5000
✓ Firebase initialized
✓ Rate limiting enabled
```

### Option 2: Run Complete Stack

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Simple HTTP Server):**
```bash
cd frontend
# Option A: Using npx (recommended)
npx http-server -p 3000 -c-1

# Option B: Using Python
python -m http.server 3000

# Option C: Using Node.js
yarn global add http-server
http-server -p 3000
```

**Terminal 3 - Firebase Emulator (Optional):**
```bash
firebase emulators:start
```

### Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health
- **Firebase Emulator:** http://localhost:4000

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Routes

#### 1. Calculate Route
**POST** `/route`

**Request:**
```json
{
  "origin": "40.7128,-74.0060",
  "destination": "40.7580,-73.9855",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "success": true,
  "message": "Route calculated successfully",
  "data": {
    "origin": {
      "address": "New York, NY, USA",
      "coordinates": { "lat": 40.7128, "lng": -74.0060 }
    },
    "destination": {
      "address": "Times Square, Manhattan, USA",
      "coordinates": { "lat": 40.7580, "lng": -73.9855 }
    },
    "distance": {
      "value": 2550,
      "text": "2.5 km"
    },
    "duration": {
      "value": 12,
      "text": "12 minutes"
    },
    "eta": "14:35",
    "coordinates": [
      { "lat": 40.7128, "lng": -74.0060 },
      { "lat": 40.7140, "lng": -74.0050 },
      ...
    ]
  }
}
```

#### 2. Forward Geocode
**POST** `/geocode`

**Request:**
```json
{
  "address": "Times Square, New York"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": { "lat": 40.758, "lng": -73.9855 },
    "address": "Times Square, Manhattan, New York, USA"
  }
}
```

#### 3. Reverse Geocode
**POST** `/geocode/reverse`

**Request:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "Lower Manhattan, New York, NY, USA",
    "name": "Empire State Building",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  }
}
```

#### 4. Get Trips
**GET** `/trips`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc123",
      "origin_address": "New York",
      "destination_address": "Boston",
      "distance_meters": 350000,
      "duration_minutes": 215,
      "timestamp": "2024-01-15T14:30:00Z"
    }
  ],
  "count": 1
}
```

#### 5. Get Statistics
**GET** `/trips/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_trips": 42,
    "total_distance_km": "1250.50",
    "total_duration_hours": "18.33",
    "average_distance_km": "29.77",
    "average_duration_minutes": "26"
  }
}
```

#### 6. Health Check
**GET** `/health`

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T14:35:00.000Z"
}
```

---

## Deployment Guide

### Deploy Backend

#### Option 1: Deploy to Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add Environment Variables (`.env` values)
7. Deploy!

#### Option 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub
3. Select this repository
4. Add `PORT`, `FIREBASE_*` variables
5. Deploy!

**Frontend URL will be:** `https://yourdomain.onrender.com`

### Deploy Frontend

#### Option 1: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

#### Option 2: Deploy to Netlify
```bash
# Via Netlify CLI
npm i -g netlify-cli
cd frontend
netlify deploy --prod --dir=.
```

#### Option 3: Deploy to Firebase Hosting
```bash
# Already configured!
firebase deploy --only hosting
```

### Update Frontend Configuration
After deployment, update the API URL in `frontend/smart-navigation.html`:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

---

## Project Structure

```
offline_map/
├── frontend/
│   ├── smart-navigation.html    # Main application UI
│   ├── styles.css               # (included in HTML)
│   ├── app.js                   # Legacy files
│   ├── map.js                   # Legacy files
│   └── index.html               # Legacy
│
├── backend/
│   ├── server.js                # Express app entry
│   ├── package.json             # Dependencies
│   ├── .env                     # Environment variables (CREATE THIS!)
│   │
│   ├── database/
│   │   └── firebasConfig.js     # Firebase initialization
│   │
│   ├── routes/
│   │   ├── navigation.js        # Route calculation endpoints
│   │   └── location.js          # Legacy
│   │
│   ├── services/
│   │   ├── navigationService.js # OpenRouteService + Nominatim
│   │   └── googleMapsService.js # Legacy
│   │
│   └── middleware/
│       ├── rateLimit.js         # Rate limiting
│       └── validation.js        # Input validation
│
├── firebase.json                # Firebase config
├── firestore.rules              # Firestore security
├── firestore.indexes.json       # Firestore indexes
│
└── docs/
    └── SETUP.md                # This file!
```

---

## Troubleshooting

### Issue: Map not loading
**Solution:**
- Ensure Leaflet.js CDN is working
- Check if OpenStreetMap tiles are accessible
- Verify `#map` div height is set

### Issue: Route calculation fails
**Solution:**
- Check if coordinates are in correct format: `lat,lng`
- Verify coordinates are valid (lat: -90 to 90, lng: -180 to 180)
- Check backend logs for OpenRouteService errors
- Ensure API rate limits aren't exceeded

### Issue: Location not detected
**Solution:**
- Enable geolocation in browser
- Check browser console for permission errors
- Use fallback location provided

### Issue: Firebase not connecting
**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env`
- Check Firebase project ID matches
- Ensure Firestore is enabled in Firebase Console
- Review firestore.rules for security issues

### Issue: CORS errors
**Solution:**
- Ensure `FRONTEND_URL` in `.env` matches your frontend domain
- Check that `Access-Control-Allow-Origin` header is set
- Verify Helmet is configured correctly

### Issue: Port 5000 or 3000 already in use
**Solution:**
```bash
# Change port in .env or command:
PORT=5001 npm start

# Or kill process on port:
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

---

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development`, `production` |
| `PORT` | Server port | No | `5000` |
| `FRONTEND_URL` | Frontend domain | Yes | `http://localhost:3000` |
| `FIREBASE_PROJECT_ID` | Firebase project | Yes | `locationdetector-f20da` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase credentials | Yes | JSON string |
| `OPENROUTE_API_KEY` | OpenRouteService key | No | Leave empty for free tier |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `100` |

---

## Performance Tips

1. **Caching Routes:** Store recent routes in localStorage
2. **Debounce Searches:** Delay API calls while typing
3. **Optimize Images:** Use WebP format for smaller sizes
4. **Lazy Loading:** Load components on demand
5. **Minify CSS/JS:** Use build tools in production

---

## Security Checklist

- ✅ All API keys in `.env` (not in code)
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation on all endpoints
- ✅ HTTPS in production
- ✅ Helmet security headers
- ✅ Firestore rules configured
- ✅ No sensitive data in logs

---

## Support & Resources

- **OpenRouteService Docs:** https://openrouteservice.org/dev/
- **Nominatim Docs:** https://nominatim.org/
- **Leaflet Docs:** https://leafletjs.com/
- **Firebase Docs:** https://firebase.google.com/docs
- **Express Docs:** https://expressjs.com/

---

## License

This project uses free and open-source technologies.
- OpenStreetMap: © OpenStreetMap contributors
- Leaflet: BSD 2-Clause License
- OpenRouteService: AGPL-3.0
- Nominatim: ODbL 1.0

**Built with ❤️ using free tools**
