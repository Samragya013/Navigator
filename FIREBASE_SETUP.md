# 🔐 Firebase Configuration Guide

Secure setup guide for Firebase Firestore with your credentials.

## 📋 Table of Contents

1. [Quick Setup](#quick-setup)
2. [Get Your Credentials](#get-your-credentials)
3. [Configure Environment Variables](#configure-environment-variables)
4. [Security Best Practices](#security-best-practices)
5. [Verify Connection](#verify-connection)
6. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Setup

Your project credentials have been provided. Follow these steps:

### 1. Copy Your `.env` File

The file `backend/.env` has already been created with your Firebase configuration:

```bash
# Check if .env exists
ls backend/.env

# View the file (should show your credentials)
cat backend/.env
```

### 2. Verify the Credentials

The `.env` file contains:
```env
FIREBASE_PROJECT_ID=locationdetector-f20da
FIREBASE_API_KEY=AIzaSyCNZm9MthLqx0WnGVjrXkNyFIaiwvtnjWs
FIREBASE_AUTH_DOMAIN=locationdetector-f20da.firebaseapp.com
FIREBASE_STORAGE_BUCKET=locationdetector-f20da.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=983896801932
FIREBASE_APP_ID=1:983896801932:web:383eed8062e46a3c7c31a9
FIREBASE_MEASUREMENT_ID=G-2XTSGYS9ZL
```

### 3. Start the Server

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✓ Firebase initialized successfully
✓ Project: locationdetector-f20da
✓ Firestore connected and ready
```

---

## 🔑 Get Your Credentials

All credentials are already provided in the `.env` file. However, here's where each comes from:

### Firebase Console Location

1. Go to: https://console.firebase.google.com
2. Select Project: **locationdetector-f20da**
3. Go to Project Settings ⚙️
4. Click "General" tab

### Credential Locations

| Credential | Where to Find |
|-----------|--------------|
| `FIREBASE_PROJECT_ID` | Project Settings > General > Project ID |
| `FIREBASE_API_KEY` | Project Settings > General > Web API Key |
| `FIREBASE_AUTH_DOMAIN` | Project Settings > General > Auth Domain |
| `FIREBASE_STORAGE_BUCKET` | Project Settings > General > Storage Bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Project Settings > General > Sender ID |
| `FIREBASE_APP_ID` | Project Settings > General > App ID |
| `FIREBASE_MEASUREMENT_ID` | Project Settings > Integrations > Google Analytics > Measurement ID |

---

## 🔒 Configure Environment Variables

### .env File Format

The `backend/.env` file has been created with all required variables.

**Important:** This file is in `.gitignore` - it's never committed to version control.

### To Update Credentials

Edit `backend/.env`:

```bash
# Open with your editor
nano backend/.env
# or
vim backend/.env
# or open in VS Code
```

Update these values:

```env
FIREBASE_PROJECT_ID=locationdetector-f20da
FIREBASE_API_KEY=AIzaSyCNZm9MthLqx0WnGVjrXkNyFIaiwvtnjWs
FIREBASE_AUTH_DOMAIN=locationdetector-f20da.firebaseapp.com
FIREBASE_STORAGE_BUCKET=locationdetector-f20da.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=983896801932
FIREBASE_APP_ID=1:983896801932:web:383eed8062e46a3c7c31a9
FIREBASE_MEASUREMENT_ID=G-2XTSGYS9ZL
```

### For Server-Side Authentication (Optional)

If you need server-side access with a service account:

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file
4. Copy the contents to `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env`

OR set individual fields:
```env
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@locationdetector-f20da.iam.gserviceaccount.com
```

---

## 🔐 Security Best Practices

### ✅ DO

- ✅ Keep `.env` file private (it's in `.gitignore`)
- ✅ Never commit `.env` to Git
- ✅ Rotate API keys every 3 months
- ✅ Use environment variables for all secrets
- ✅ Enable Firebase rules for Firestore
- ✅ Enable billing alerts in Firebase Console
- ✅ Review Firebase usage regularly
- ✅ Use different API keys for development vs production

### ❌ DON'T

- ❌ Access `.env` file in frontend code
- ❌ Expose credentials in logs
- ❌ Share `.env` file with team (use password manager)
- ❌ Commit `.env` to version control
- ❌ Use production keys in development
- ❌ Enable all Firestore read/write permissions
- ❌ Leave API keys unrestricted

---

## 🔥 Enable Firestore Security Rules

### Set Up Firestore Access Control

1. Go to Firebase Console
2. Firestore Database > Rules tab
3. Replace rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to authenticated users only
    match /location_requests/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Public read for results (optional)
    match /results/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

4. Click "Publish"

---

## ✅ Verify Connection

### Method 1: Start Server and Check Logs

```bash
cd backend
npm run dev
```

Look for:
```
✓ Firebase initialized successfully
✓ Project: locationdetector-f20da
✓ Firestore connected and ready
```

### Method 2: Test API Endpoint

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "healthy",
  "message": "Location API is running.",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### Method 3: Test Location Endpoint

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
```

If Firebase is connected, data will be saved to Firestore.

### Method 4: Check Firestore Console

1. Go to Firebase Console
2. Firestore Database
3. Collection: `location_requests`
4. Should see new documents after API calls

---

## 🧪 Troubleshooting

### Error: "Firebase not initialized"

**Cause:** `.env` file doesn't exist or missing variables

**Solution:**
```bash
# Verify .env exists
ls backend/.env

# Check variables are set
cat backend/.env | grep FIREBASE_PROJECT_ID

# If missing, re-create from .env.example
cp backend/.env.example backend/.env
# Then edit with your values
```

### Error: "Missing Firebase configuration"

**Cause:** Required environment variables are missing

**Required variables:**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

**Solution:**
```bash
# Check which are missing
grep "FIREBASE_" backend/.env

# All should have values
```

### Error: "Cannot initialize Firestore"

**Cause:** Invalid credentials or Firebase project issue

**Solution:**
```bash
# Verify credentials in Firebase Console:
# 1. Project exists
# 2. Firestore database is enabled
# 3. Credentials are correct and not revoked
# 4. Billing is enabled (some operations require it)

# Check logs for detailed error
npm run dev
```

### Error: "Service Account authentication failed"

**Cause:** `FIREBASE_SERVICE_ACCOUNT_KEY` malformed

**Solution:**
```bash
# Use individual fields instead:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"

# Or regenerate the key:
# Firebase Console > Project Settings > Service Accounts > Generate New Private Key
```

### Data Not Saving to Firestore

**Cause:** Firestore rules blocking write access

**Solution:**
```javascript
// Update Firestore rules to allow writes:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For development only
    }
  }
}
```

### API Returns "Service Unavailable"

**Cause:** Firestore temporarily down

**Solution:**
- Check Firebase status: https://status.firebase.google.com
- Verify project status in Firebase Console
- Try again in a few minutes
- Enable offline persistence for resilience

---

## 🔄 Rotating Credentials

### Rotate API Keys

1. Firebase Console > Project Settings > User and API keys
2. Click the rotation icon ♻️
3. Confirm rotation
4. Update `.env` with new key
5. Test connection

### Rotate Service Account Key

1. Firebase Console > Project Settings > Service Accounts
2. Delete old key
3. Generate new private key
4. Update `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env`
5. Restart server

---

## 📊 Monitoring

### Check Firestore Usage

1. Firebase Console > Firestore Database
2. Data tab: See stored documents
3. Usage tab: Monitor read/write operations

### Set Up Billing Alerts

1. Google Cloud Console
2. Billing > Budgets and alerts
3. Create alert when usage exceeds threshold

### Monitor API Calls

Check backend logs for API activity:

```bash
# View recent logs
tail -f logs/api.log

# Or check in Firebase Console > Firestore > Usage
```

---

## 🚀 Production Setup

### For Production Servers

1. **Use Environment Variables**
   - Set via platform dashboard (Render, Railway, Heroku)
   - Never hardcode credentials

2. **Enable Firestore Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /location_requests/{document=**} {
         allow read: if true;
         allow create: if request.auth != null || request.resource.data.timestamp == request.time;
         allow update, delete: if false;
       }
     }
   }
   ```

3. **Enable Audit Logging**
   - Google Cloud Console > Logging
   - Monitor all API access

4. **Setup Backup**
   - Firebase Console > Firestore > Backups
   - Enable automated daily backups

---

## 🎯 Next Steps

1. ✅ Verify `.env` file is configured
2. ✅ Start backend: `npm run dev`
3. ✅ Test API endpoints
4. ✅ Enable Firestore security rules
5. ✅ Monitor Firestore usage
6. ✅ Deploy to production

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Check env file | `cat backend/.env` |
| Start server | `npm run dev` |
| Test API | `curl http://localhost:5000/api/health` |
| View Firebase | https://console.firebase.google.com |
| View Firestore | Firebase Console > Firestore Database |
| Check Firestore usage | Firebase Console > Firestore > Usage |

---

**Your Firebase project is configured and ready to use! 🎉**
