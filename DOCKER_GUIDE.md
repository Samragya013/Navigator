# 🐳 DOCKER & LOCAL TESTING GUIDE

## Quick Start with Docker

### Prerequisites
- Docker installed (https://docker.com/products/docker-desktop)
- 4GB RAM available
- Project root directory

### Run Complete Stack

```bash
# Navigate to project root
cd Navigator

# Build and start all services
docker-compose up -d

# Check if running
docker-compose ps

# View logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# API Health: http://localhost:5000/api/health
```

### Stop Services

```bash
# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild images (if you made code changes)
docker-compose up -d --build
```

---

## Common Issues & Solutions

### ❌ Error: "failed to read dockerfile: open Dockerfile: no such file or directory"

**Cause:** Running docker-compose from wrong directory

**Solution:**
```bash
# WRONG - From frontend directory
cd frontend
docker-compose up        # ❌ FAILS

# CORRECT - From project root
cd Navigator
docker-compose up        # ✅ WORKS

# Or use absolute path
docker-compose -f /path/to/Navigator/docker-compose.yml up
```

### ❌ Error: "port is already in use"

**Cause:** Another service using ports 5000 or 3000

**Solution:**
```bash
# Find what's using port 5000 (Windows)
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different ports (edit docker-compose.yml)
# Change "5000:5000" to "5001:5000"
```

### ❌ Error: "Docker daemon not running"

**Cause:** Docker Desktop not started

**Solution:**
1. Open Docker Desktop
2. Wait for it to fully load
3. Try again

### ❌ Containers exit immediately

**Cause:** Application error or missing dependencies

**Solution:**
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## Development Workflow

### Option 1: With Docker (Recommended)

```bash
# Start everything
docker-compose up -d

# Make code changes (they auto-reload)
# Edit backend/server.js
# Restart if needed: docker-compose restart backend

# View changes at http://localhost:3000

# Stop when done
docker-compose down
```

### Option 2: Without Docker (Local Development)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Runs on http://localhost:5000

# Terminal 2: Frontend (in separate terminal)
cd frontend
# Open index.html in browser directly
# Or run HTTP server:
npx http-server . -p 3000
# Runs on http://localhost:3000
```

---

## Using Alternative Compose File

For development with hot reload and debugging:

```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up -d

# Or set as default
export COMPOSE_FILE=docker-compose.dev.yml
docker-compose up -d
```

This file includes:
- Volume mounts for live code reloading
- Debug environment variables
- Additional network configuration

---

## Docker Compose Commands Reference

```bash
# Start services in background
docker-compose up -d

# Start services with logs visible
docker-compose up

# Stop services (keep containers)
docker-compose stop

# Start stopped services
docker-compose start

# Remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v

# View running containers
docker-compose ps

# View logs
docker-compose logs              # All services
docker-compose logs backend      # Specific service
docker-compose logs -f backend   # Follow logs in real-time

# Execute command in container
docker-compose exec backend sh
docker-compose exec backend npm test

# Rebuild images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Restart service
docker-compose restart backend
```

---

## Troubleshooting Guide

### Check if Containers Are Running

```bash
docker ps              # Running containers
docker ps -a          # All containers

# Should see:
# navigator-backend    - running on port 5000
# navigator-frontend   - running on port 3000
```

### Check Service Logs

```bash
# Recent logs
docker-compose logs --tail 50 backend

# Real-time logs
docker-compose logs -f backend

# Include timestamps
docker-compose logs -f --timestamps backend
```

### Test Backend Health

```bash
# From host machine
curl http://localhost:5000/api/health

# Should return:
# {"status":"ok","message":"..."}

# From inside container
docker-compose exec backend curl http://localhost:5000/api/health
```

### Test Frontend

```bash
# Check if nginx is serving files
curl http://localhost:3000

# Should return HTML from index.html
```

### Verify Network Connectivity

```bash
# Get container IP addresses
docker-compose exec backend hostname -I

# Test backend from frontend container
docker-compose exec frontend wget -O- http://backend:5000/api/health

# Test from backend to frontend
docker-compose exec backend curl http://nginx:3000
```

---

## Docker Volume Issues

### Volume Not Updating

```bash
# Remove and recreate volumes
docker-compose down -v
docker-compose up -d --build

# Or use bind mounts instead
# Edit docker-compose.yml and change volumes paths
```

### Clear Docker Cache

```bash
# Remove dangling volumes
docker volume prune

# Remove dangling containers
docker container prune

# Full cleanup (be careful!)
docker system prune -a

# This removes:
# - Stopped containers
# - Unused images
# - Unused networks
# - Dangling volumes
```

---

## Production Docker Build

For deploying with Docker to production:

```bash
# Build production image
docker build -t navigator-backend:latest ./backend

# Test locally
docker run -p 5000:10000 \
  -e NODE_ENV=production \
  -e PORT=10000 \
  navigator-backend:latest

# Push to registry (Docker Hub, ECR, etc.)
docker tag navigator-backend:latest your-registry/navigator-backend:latest
docker push your-registry/navigator-backend:latest
```

---

## Environment Variables in Docker

### Pass Environment Variables

```bash
# Via .env file
# Create .env in project root
NODE_ENV=development
PORT=5000

# Start with .env
docker-compose up

# Or inline
docker-compose up -e NODE_ENV=production

# Or in docker-compose.yml
# Already configured in services → environment section
```

---

## Performance Optimization

### Reduce Build Time

```bash
# Use BuildKit (faster)
export DOCKER_BUILDKIT=1
docker-compose build

# Build in parallel
docker-compose build --parallel
```

### Reduce Image Size

```bash
# Alpine images are smaller
# Already using node:18-alpine in Dockerfile

# Clean up after build
# .dockerignore excludes unnecessary files
```

### Monitor Resource Usage

```bash
# See container stats
docker stats

# Keep running to see real-time usage
docker stats --no-stream

# Limit resources in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## Debugging

### Interactive Shell

```bash
# Connect to running backend container
docker-compose exec backend sh

# Check backendfiles
ls -la /app

# Check installed dependencies
npm list

# Check running processes
ps aux

# Print logs
cat app.log
```

### Debug Mode

Edit docker-compose.yml to add:
```yaml
backend:
  environment:
    - LOG_LEVEL=debug
    - NODE_ENV=development
  command: node --inspect=0.0.0.0:9229 server.js
  ports:
    - "9229:9229"  # Debug port
```

Then connect your debugger to `localhost:9229`

---

## Next Steps

✅ **Local Testing Complete:**
1. Docker setup working
2. Services running
3. Frontend accessible
4. Backend responsive

📦 **Ready for Deployment:**
1. Ensure docker-compose works locally
2. Push code to GitHub
3. Follow [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
4. Deploy to Render.com

---

## Support

- **Docker Docs:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/
- **Troubleshooting:** Check logs with `docker-compose logs -f`

**Happy Docker development! 🐳**
