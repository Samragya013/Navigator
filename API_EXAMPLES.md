# API Examples and Response Reference

Complete collection of API requests and responses for testing.

## Base URL

- **Local Development:** `http://localhost:5000`
- **Production:** `https://your-backend-api.com`

---

## 1. POST /api/location

### Request: Calculate Time for New York

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### Success Response (200)

```json
{
  "status": "success",
  "message": "Estimated travel time calculated successfully.",
  "estimated_time": "25 minutes",
  "distance": "20.50 kilometers",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  },
  "timestamp": "2026-03-31T12:00:00.000Z",
  "requestId": "aBcDeF123456",
  "provider": "OpenRouteService"
}
```

### Error Response: Invalid Coordinates (400)

```json
{
  "status": "error",
  "message": "Invalid coordinates provided.",
  "errors": [
    {
      "value": 95,
      "msg": "Latitude must be between -90 and 90",
      "param": "latitude",
      "location": "body"
    }
  ],
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### Error Response: Service Unavailable (503)

```json
{
  "status": "error",
  "message": "Distance calculation service temporarily unavailable. Please try again later.",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### Error Response: Rate Limited (429)

```json
{
  "status": "error",
  "message": "Too many location requests. Please wait before trying again.",
  "retryAfter": 45,
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

---

## 2. GET /api/result/:requestId

### Request: Get Stored Result

```bash
curl http://localhost:5000/api/result/aBcDeF123456
```

### Success Response (200)

```json
{
  "status": "success",
  "message": "Result retrieved successfully.",
  "data": {
    "id": "aBcDeF123456",
    "latitude": 40.7128,
    "longitude": -74.006,
    "estimatedTime": "25 minutes",
    "status": "success",
    "createdAt": "2026-03-31T12:00:00.000Z"
  },
  "timestamp": "2026-03-31T12:00:01.000Z"
}
```

### Error Response: Not Found (404)

```json
{
  "status": "error",
  "message": "Request not found.",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

---

## 3. POST /api/validate

### Request: Validate Coordinates

```bash
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### Success Response (200)

```json
{
  "status": "success",
  "message": "Coordinates are valid.",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### Error Response: Invalid Format (400)

```json
{
  "status": "error",
  "message": "Invalid coordinate format."
}
```

### Error Response: Out of Range (400)

```json
{
  "status": "error",
  "message": "Coordinates out of valid range."
}
```

---

## 4. GET /api/health

### Request: Health Check

```bash
curl http://localhost:5000/api/health
```

### Success Response (200)

```json
{
  "status": "healthy",
  "message": "Location API is running.",
  "timestamp": "2026-03-31T12:00:00.000Z",
  "uptime": 3600.45
}
```

---

## 5. GET / (Root)

### Request: API Info

```bash
curl http://localhost:5000/
```

### Response (200)

```json
{
  "message": "Interactive Map - Time Estimation API",
  "version": "1.0.0",
  "status": "online",
  "endpoints": {
    "postLocation": "POST /api/location",
    "getResult": "GET /api/result/:requestId",
    "validateCoordinates": "POST /api/validate",
    "health": "GET /api/health"
  }
}
```

---

## 6. GET /docs

### Request: Documentation

```bash
curl http://localhost:5000/docs
```

### Response (200)

Complete API documentation in JSON format including all endpoints, parameters, and examples.

---

## Test Cases by Location

### Test 1: New York

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

Expected: ~25 minutes, ~20 km

### Test 2: London

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 51.5074,
    "longitude": -0.1278
  }'
```

Expected: ~18 minutes, ~15 km

### Test 3: Tokyo

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 35.6762,
    "longitude": 139.6503
  }'
```

Expected: ~20 minutes, ~16 km

### Test 4: Sydney

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -33.8688,
    "longitude": 151.2093
  }'
```

Expected: ~14 minutes, ~11 km

---

## Error Test Cases

### Test: Invalid Latitude (Too High)

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 95,
    "longitude": -74.0060
  }'
```

Expected Response: 400 Bad Request

### Test: Missing Parameters

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128
  }'
```

Expected Response: 400 Bad Request

### Test: Invalid JSON

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

Expected Response: 400 Bad Request

### Test: Rate Limit (30 requests in 60 seconds)

```bash
for i in {1..35}; do
  curl -X POST http://localhost:5000/api/location \
    -H "Content-Type: application/json" \
    -d '{
      "latitude": 40.7128,
      "longitude": -74.0060
    }' &
done
wait
```

Expected: First 30 succeed (200), next 5 fail (429)

---

## Frontend JavaScript Testing

### Test From Browser Console

```javascript
// Fetch time estimation
fetch('http://localhost:5000/api/location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 40.7128,
    longitude: -74.0060
  })
})
.then(r => r.json())
.then(data => console.log(data));

// Get result
fetch('http://localhost:5000/api/result/REQUEST_ID')
  .then(r => r.json())
  .then(data => console.log(data));

// Validate
fetch('http://localhost:5000/api/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 40.7128,
    longitude: -74.0060
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## Time Estimation Examples

### Time Format Examples

```
"estimated_time": "Less than a minute"
"estimated_time": "1 minute"
"estimated_time": "5 minutes"
"estimated_time": "30 minutes"
"estimated_time": "1 hour"
"estimated_time": "2 hours"
"estimated_time": "1 hour and 15 minutes"
"estimated_time": "3 hours and 45 minutes"
```

---

## Status Codes Reference

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid coordinates or format |
| 404 | Not Found | Request ID doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External API down |

---

## Response Time Expectations

| Operation | Time (ms) |
|-----------|----------|
| Health Check | <50 |
| Validate | 50-100 |
| Calculate (OpenRouteService) | 500-1500 |
| Calculate (Google Maps) | 300-1000 |
| Store to Firebase | 100-500 |
| Retrieve Result | 50-200 |

---

## Testing with Postman

### Import Collection

1. Open Postman
2. Create new collection: "Interactive Map"
3. Add requests:

```
POST http://localhost:5000/api/location
Headers: Content-Type: application/json
Body: {
  "latitude": 40.7128,
  "longitude": -74.0060
}

GET http://localhost:5000/api/health

GET http://localhost:5000/api/result/{{requestId}}

POST http://localhost:5000/api/validate
Body: {
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

---

## Debugging Tips

### Check Request Headers

```bash
curl -v http://localhost:5000/api/health
```

### Check CORS

```bash
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:5000/api/location
```

### Verbose Output

```bash
curl -v -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
```

### Check Response Headers

```bash
curl -i http://localhost:5000/api/health
```

---

## Performance Testing

### Load Testing (1000 requests)

```bash
ab -n 1000 -c 10 http://localhost:5000/api/health
```

### Concurrent Requests

```bash
# 50 concurrent requests
for i in {1..50}; do
  curl http://localhost:5000/api/health &
done
wait
```

---

Last Updated: March 31, 2026
