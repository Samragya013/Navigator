# 🔐 Security Configuration Checklist

Complete checklist to ensure your Firebase and backend are properly secured.

## ✅ Backend Security Configuration

- [ ] `.env` file created and contains all Firebase credentials
- [ ] `.env` file is in `.gitignore` (never committed)
- [ ] `FIREBASE_PROJECT_ID` is set correctly
- [ ] `FIREBASE_API_KEY` is set correctly
- [ ] All FIREBASE_* environment variables are populated
- [ ] Environment variables contain no quotes or extra whitespace
- [ ] `.env` file has restricted permissions (readable by app only)

## ✅ Firebase Console Configuration

### Project Settings
- [ ] Firebase project ID: `locationdetector-f20da` is created
- [ ] Firestore database is enabled
- [ ] Web app is registered in Firebase Console
- [ ] All credentials match between Firebase Console and `.env`

### Firestore Database
- [ ] Firestore is initialized and empty or has test data
- [ ] Database location is set (preferably near your users)
- [ ] Backup is enabled
- [ ] Audit logging is enabled (production)

### Security Rules
- [ ] Firestore security rules are configured
- [ ] Rules allow authenticated write access
- [ ] Rules restrict public write access
- [ ] Rules are tested and working

### Authentication
- [ ] Firebase Authentication is enabled (if using)
- [ ] Service account has appropriate permissions
- [ ] API restrictions are set (if needed)

## ✅ Environment Variable Security

### Development
- [ ] `.env` is in root of backend directory
- [ ] `.env` is in `.gitignore`
- [ ] `.env` contains development credentials only
- [ ] File permissions: `600` (readable by app only)

### Production
- [ ] Environment variables are set via platform dashboard
- [ ] No `.env` file on production server
- [ ] Credentials never appear in logs
- [ ] API keys have IP restrictions (if available)
- [ ] Rate limiting is enabled

## ✅ API Security

### Rate Limiting
- [ ] Rate limiting is enabled globally
- [ ] Location endpoint has stricter rate limit (30/min)
- [ ] Global rate limit is set (100/15min)
- [ ] Rate limit info is returned in headers

### Input Validation
- [ ] Latitude validation (−90 to +90)
- [ ] Longitude validation (−180 to +180)
- [ ] Invalid coordinates are rejected
- [ ] Error messages don't leak sensitive info

### CORS
- [ ] CORS is configured with allowed origins
- [ ] Frontend URL matches `FRONTEND_URL` in `.env`
- [ ] Credentials are allowed only for same-origin
- [ ] Preflight requests are handled

### Security Headers
- [ ] Helmet.js is enabled (security headers)
- [ ] X-Frame-Options is set
- [ ] Content-Security-Policy is set
- [ ] X-Content-Type-Options is set
- [ ] HSTS is enabled (production)

## ✅ Error Handling

- [ ] Error messages don't expose stack traces
- [ ] Error messages are user-friendly
- [ ] Sensitive errors are logged, generic shown to users
- [ ] 500 errors don't reveal system details
- [ ] Firebase errors are caught and sanitized

## ✅ Logging & Monitoring

- [ ] Request logging is enabled
- [ ] Error logging is configured
- [ ] Sensitive data is not logged
- [ ] Log files are stored securely
- [ ] Log rotation is configured

## ✅ Server Startup

- [ ] Server validates Firebase config on startup
- [ ] Missing credentials cause informative errors
- [ ] Graceful shutdown is implemented
- [ ] Process cleanup happens on exit
- [ ] Firestore connection is closed properly

## ✅ Testing Verification

### API Endpoint Tests

```bash
# Health check
curl http://localhost:5000/api/health
# Expected: 200 OK

# Location endpoint
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
# Expected: 200 OK, data saved to Firestore

# Validation endpoint
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
# Expected: 200 OK

# Invalid coordinates
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 95, "longitude": -74.0060}'
# Expected: 400 Bad Request
```

- [ ] Health endpoint responds correctly
- [ ] Location endpoint saves to Firestore
- [ ] Validation works for valid coordinates
- [ ] Invalid coordinates are rejected
- [ ] Error responses are appropriate

### Rate Limit Test

```bash
# Make 35 rapid requests to location endpoint
for i in {1..35}; do
  curl -X POST http://localhost:5000/api/location \
    -H "Content-Type: application/json" \
    -d '{"latitude": 40.7128, "longitude": -74.0060}' &
done
wait
# Expected: First 30 succeed (200), next 5 fail (429)
```

- [ ] First 30 requests succeed
- [ ] Next 5 requests are rate limited (429)
- [ ] Rate limit header is present
- [ ] Rate limit resets after 1 minute

### Firestore Connection Test

```bash
# Check logs for Firebase connection
npm run dev
# Look for:
# ✓ Firebase initialized successfully
# ✓ Project: locationdetector-f20da
# ✓ Firestore connected and ready
```

- [ ] Firebase initializes without errors
- [ ] Firestore connection is successful
- [ ] Credentials are validated
- [ ] Connection persists

### Frontend Connectivity Test

- [ ] Frontend connects to backend
- [ ] Frontend can call API endpoints
- [ ] Results display in UI
- [ ] No CORS errors in browser console

## ✅ Database Security

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /location_requests/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

- [ ] Rules are deployed and active
- [ ] Only authenticated users can write (if required)
- [ ] Public read access is configured correctly
- [ ] Rules are tested in Firestore console

### Data Protection
- [ ] No sensitive personal data is stored
- [ ] Timestamps are set automatically
- [ ] Data retention policy is defined
- [ ] Old data is periodically cleaned up

## ✅ Deployment Readiness

- [ ] All dependencies are installed
- [ ] No development packages in production
- [ ] Build is optimized
- [ ] Environment is configured correctly
- [ ] Logs are sent to appropriate location
- [ ] Monitoring/alerts are set up

## ✅ Production Deployment

- [ ] Use production Firebase credentials
- [ ] Use different API keys for each environment
- [ ] Enable API key restrictions by IP
- [ ] Enable API key restrictions by API
- [ ] Setup automatic backups
- [ ] Configure audit logging
- [ ] Implement monitoring and alerts
- [ ] Test failover/recovery procedures

## ✅ Ongoing Maintenance

- [ ] Weekly: Check Firebase usage
- [ ] Monthly: Rotate API keys
- [ ] Monthly: Review security logs
- [ ] Quarterly: Update dependencies
- [ ] Quarterly: Audit security rules

## 🚨 Security Incident Response

If credentials are compromised:

1. **Immediately:**
   - [ ] Revoke compromised API keys
   - [ ] Rotate service account keys
   - [ ] Update `.env` on all servers
   - [ ] Restart application

2. **Within 1 hour:**
   - [ ] Check Firestore audit logs
   - [ ] Delete any unauthorized documents
   - [ ] Update security rules if needed
   - [ ] Notify team members

3. **Within 24 hours:**
   - [ ] Review security logs
   - [ ] Document the incident
   - [ ] Update incident procedures
   - [ ] Post-mortem analysis

---

## 📋 Pre-Deployment Checklist

Before going to production:

```
Backend Setup
├─ [ ] npm install complete
├─ [ ] .env configured with production credentials
├─ [ ] All environment variables set
├─ [ ] No hardcoded secrets in code
├─ [ ] Rate limiting enabled
├─ [ ] Error handling complete
└─ [ ] Tests passing

Firebase Configuration
├─ [ ] Project created
├─ [ ] Firestore enabled
├─ [ ] Security rules deployed
├─ [ ] Backups enabled
├─ [ ] Audit logging enabled
└─ [ ] Billing configured

Security
├─ [ ] CORS properly configured
├─ [ ] Security headers enabled
├─ [ ] Input validation working
├─ [ ] Rate limiting tested
├─ [ ] Error messages generic
└─ [ ] Logs don't expose secrets

Monitoring
├─ [ ] Logging configured
├─ [ ] Alerts set up
├─ [ ] Metrics collection enabled
├─ [ ] Error tracking enabled
└─ [ ] Performance monitoring configured
```

---

## ✨ Security Best Practices Summary

1. **Never commit `.env` to source control**
2. **Use environment variables for all secrets**
3. **Rotate API keys regularly**
4. **Enable Firestore security rules**
5. **Implement rate limiting**
6. **Validate all inputs**
7. **Handle errors securely**
8. **Monitor and log appropriately**
9. **Use HTTPS/TLS in production**
10. **Regular security audits**

---

## 📞 Quick Verification

Run this to verify everything is set up correctly:

```bash
# 1. Check .env exists
ls -la backend/.env

# 2. Verify Firebase variables
grep "FIREBASE_PROJECT_ID\|FIREBASE_API_KEY" backend/.env

# 3. Start server
cd backend
npm run dev

# 4. Test health endpoint
curl http://localhost:5000/api/health

# 5. Test location endpoint
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'

# If all pass, you're ready to deploy! ✅
```

---

**Your application is now properly secured! 🔐**

For any issues, check FIREBASE_SETUP.md or troubleshooting section.
