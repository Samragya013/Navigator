# Interactive Map-Based Time Estimation System

A production-ready web application that allows users to select a location on an interactive map and receive real-time time estimation through backend API integration.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

## ✨ Features

### Frontend
- ✅ Interactive map powered by Leaflet.js
- ✅ Dark charcoal theme with smooth animations
- ✅ Click-to-select location with real-time marker
- ✅ Auto-detect user's current location
- ✅ Real-time loading states
- ✅ Beautiful result cards (no alert boxes)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Vanilla JavaScript (no frameworks)

### Backend
- ✅ Express.js REST API
- ✅ Real-time distance calculation
- ✅ Input validation and sanitization
- ✅ Rate limiting and security headers
- ✅ Error handling with clean English messages
- ✅ Firebase Firestore integration
- ✅ Request logging
- ✅ Health check endpoints

### Database
- ✅ Firebase Firestore (recommended)
- ✅ MongoDB support (fallback)
- ✅ Automatic data cleanup
- ✅ Query optimization

### External APIs
- ✅ OpenRouteService (free, no key required)
- ✅ Google Distance Matrix API (optional)
- ✅ Mock calculation for development

## 🛠️ Tech Stack

### Frontend
- HTML5 + CSS3 (Modern, Dark Theme)
- Vanilla JavaScript (No frameworks)
- Leaflet.js 1.9.4 (Maps)
- Axios (HTTP requests)

### Backend
- Node.js 18+
- Express.js 4.18
- Firebase Admin SDK
- Axios (API calls)
- Express Rate Limit
- Helmet (Security)
- CORS

### Database
- Firebase Firestore (Primary)
- MongoDB (Optional)

### External Services
- OpenRouteService API
- Google Distance Matrix API (Optional)

### Deployment
- Vercel (Frontend)
- Netlify (Frontend)
- Render (Backend)
- Railway (Backend)

## 📁 Project Structure

```
offline_map/
├── frontend/
│   ├── index.html          # Main HTML template
│   ├── styles.css          # Dark theme styling
│   ├── app.js              # App initialization & utilities
│   └── map.js              # Leaflet map interactions
│
├── backend/
│   ├── server.js           # Express server entry point
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment variables template
│   │
│   ├── routes/
│   │   └── location.js     # Location API endpoints
│   │
│   ├── middleware/
│   │   ├── validation.js   # Input validation
│   │   └── rateLimit.js    # Rate limiting
│   │
│   ├── services/
│   │   └── distanceCalculator.js  # Distance/time calculation
│   │
│   └── database/
│       └── firebasConfig.js        # Firebase Firestore setup
│
├── README.md               # This file
├── DEPLOYMENT.md           # Deployment guide
└── .gitignore             # Git ignore rules
```

## 🚀 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Internet connection
- Firebase account (optional, for production)

### 1. Clone the Repository

```bash
cd offline_map
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
nano .env
```

Required environment variables:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Choose one:
OPENROUTE_ENABLED=true      # Free (recommended)
GOOGLE_MAPS_ENABLED=false   # Requires API key

# Optional: Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email
```

#### Start Backend Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The backend will start at `http://localhost:5000`

### 3. Frontend Setup

No build process needed! Simply open `frontend/index.html` in a browser or serve it:

**Using Python 3:**
```bash
cd frontend
python -m http.server 3000
```

**Using Node.js (SimpleHTTP):**
```bash
cd frontend
npx http-server -p 3000
```

**Using Live Server (VS Code):**
```
Right-click index.html → Open with Live Server
```

The frontend will be available at `http://localhost:3000`

## ⚙️ Configuration

### Updating API Base URL

Edit `frontend/map.js`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://your-backend-url.com'  // Change this
    : 'http://localhost:5000';
```

### Firebase Firestore Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Firestore Database

2. **Get Service Account:**
   - Project Settings → Service Accounts
   - Generate new private key
   - Copy credentials to `.env`

3. **Database Structure:**
   - Collection: `location_requests`
   - Documents with fields:
     - `latitude` (number)
     - `longitude` (number)
     - `estimatedTime` (string)
     - `status` (string)
     - `createdAt` (timestamp)

### Supported Distance APIs

#### OpenRouteService (Recommended - Free)

```env
OPENROUTE_ENABLED=true
OPENROUTE_API_KEY=your-api-key  # Optional
```

- No API key required for basic usage
- Free tier: 2,500 requests/day
- Signup: https://openrouteservice.org

#### Google Distance Matrix API

```env
GOOGLE_MAPS_ENABLED=true
GOOGLE_MAPS_API_KEY=your-api-key  # Required
```

- Signup: https://cloud.google.com/maps-platform
- Enable Distance Matrix API
- Set up billing

## 📖 Usage

### Basic Workflow

1. **Open Application:**
   - Navigate to `http://localhost:3000`
   - Map loads with your current location (if enabled)

2. **Select Location:**
   - Click anywhere on the map
   - A green marker appears
   - Loading spinner shows while processing

3. **View Result:**
   - Clean result card displays
   - Shows: Location, Estimated Time, Status
   - Timestamp included

4. **Select Another Location:**
   - Click anywhere on map again
   - Process repeats

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo last selection (if implemented)
- `Escape` - Close result card

### Map Controls

- **Zoom:** Scroll wheel or +/- buttons
- **Pan:** Click and drag
- **Geolocation:** Button to center on current location (if available)

## 🔌 API Endpoints

All responses are in **English** with proper HTTP status codes.

### 1. POST /api/location

**Submit location and get time estimation**

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Estimated travel time calculated successfully.",
  "estimated_time": "25 minutes",
  "distance": "20.50 kilometers",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "timestamp": "2026-03-31T12:00:00.000Z",
  "requestId": "doc123",
  "provider": "OpenRouteService"
}
```

**Error Response (400/500):**
```json
{
  "status": "error",
  "message": "Invalid coordinates provided.",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### 2. GET /api/result/:requestId

**Retrieve stored result by ID**

```bash
curl http://localhost:5000/api/result/doc123
```

**Response:**
```json
{
  "status": "success",
  "message": "Result retrieved successfully.",
  "data": {
    "id": "doc123",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "estimatedTime": "25 minutes",
    "status": "success",
    "createdAt": "2026-03-31T12:00:00.000Z"
  }
}
```

### 3. POST /api/validate

**Validate coordinates without storing**

```bash
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Coordinates are valid.",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

### 4. GET /api/health

**Health check**

```bash
curl http://localhost:5000/api/health
```

### 5. GET /docs

**API Documentation**

```bash
curl http://localhost:5000/docs
```

## 🔒 Security Features

### Input Validation
- ✅ Latitude range: -90 to +90
- ✅ Longitude range: -180 to +180
- ✅ Type checking
- ✅ Sanitization

### Rate Limiting
- ✅ Global: 100 requests per 15 minutes
- ✅ Location endpoint: 30 requests per minute
- ✅ Token bucket algorithm
- ✅ IP-based tracking

### CORS Protection
- ✅ Whitelist frontend origin
- ✅ Credentials support
- ✅ Preflight handling

### Security Headers (Helmet)
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ X-Content-Type-Options

### Environment Protection
- ✅ API keys in environment variables
- ✅ No credentials in code
- ✅ `.env` file excluded from git

### Request Logging
- ✅ All requests logged with timestamp
- ✅ Status codes tracked
- ✅ Performance metrics included

## 🐛 Troubleshooting

### Map Not Loading

**Issue:** Map appears blank
- **Solution:** Check browser console for errors
- **Check:** Leaflet CDN is accessible
- **Check:** Map container has height (CSS issue)

### "Location Request Failed"

**Issue:** Error when clicking map
- **Solution:** Check backend is running (`npm run dev`)
- **Solution:** Check `API_BASE_URL` in `map.js` is correct
- **Solution:** Check CORS is enabled in backend

### Rate Limit Exceeded

**Issue:** "Too many requests" error
- **Solution:** Wait 1 minute for location endpoint
- **Solution:** Wait 15 minutes for global limit reset

### Firebase Connection Error

**Issue:** "Firebase not initialized"
- **Solution:** Check `.env` file has Firebase credentials
- **Solution:** Verify Firestore is enabled
- **Solution:** Check credentials are properly formatted (quotes, newlines)

### Coordinates Invalid

**Issue:** "Invalid coordinates provided"
- **Solution:** Latitude must be between -90 and 90
- **Solution:** Longitude must be between -180 and 180
- **Solution:** Use decimal notation (40.7128, not "40.7128")

### Cannot Get User Location

**Issue:** Map doesn't center on current location
- **Solutions:**
  - Browser may have blocked geolocation
  - Check browser permissions
  - This is not critical; map still works
  - Manually zoom/pan to desired location

### "Service Temporarily Unavailable"

**Issue:** Distance API error
- **Solution:** Check API credentials in `.env`
- **Solution:** Verify API service is up
- **Solution:** Check rate limits on API service
- **Solution:** Try fallback API (switch `OPENROUTE_ENABLED`)

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions covering:
- ✅ Netlify (Frontend)
- ✅ Vercel (Frontend)
- ✅ Render (Backend)
- ✅ Railway (Backend)
- ✅ Environment Setup
- ✅ Custom Domain Setup
- ✅ SSL/HTTPS

## 📝 API Response Examples

### Time Estimation Variations

```javascript
// Less than a minute
"estimated_time": "Less than a minute"

// Minutes
"estimated_time": "25 minutes"
"estimated_time": "1 minute"

// Hours
"estimated_time": "2 hours"

// Hours and minutes
"estimated_time": "1 hour and 30 minutes"
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Request successful |
| 400 | Invalid input/coordinates |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Server error |
| 503 | Service unavailable |

## 🧪 Testing Coordinates

Use these coordinates for testing:

```
New York: 40.7128, -74.0060
London: 51.5074, -0.1278
Tokyo: 35.6762, 139.6503
Sydney: -33.8688, 151.2093
Berlin: 52.5200, 13.4050
```

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 💬 Support

For issues or questions:
1. Check this README
2. See DEPLOYMENT.md
3. Check browser console for errors
4. Check backend logs
5. Verify environment variables

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement real-time updates with WebSockets
- [ ] Add location favorites/history
- [ ] Multi-stop route optimization
- [ ] Weather integration
- [ ] Mobile app (React Native)
- [ ] Admin dashboard

---

**Built with ❤️ using Leaflet.js, Express.js, and vanilla JavaScript**

Last Updated: March 31, 2026
