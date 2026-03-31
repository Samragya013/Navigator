#!/bin/bash

# Netlify + Render Deployment Script
# This script helps you deploy your application to production

set -e

echo "🚀 Offline Map - Production Deployment Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Step 1: Verify Project Structure
echo "Step 1: Verifying project structure..."
if [ ! -d "frontend" ] || [ ! -d "backend" ] || [ ! -f "netlify.toml" ]; then
    print_error "Project structure is incomplete!"
    print_info "Required: frontend/, backend/, netlify.toml"
    exit 1
fi
print_success "Project structure verified"
echo ""

# Step 2: Check Git Status
echo "Step 2: Checking Git status..."
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    print_warning "Not a Git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial commit"
else
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Uncommitted changes detected"
        git status --short
    else
        print_success "All changes committed"
    fi
fi
echo ""

# Step 3: Verify Backend Configuration
echo "Step 3: Verifying backend configuration..."
if [ ! -f "backend/.env" ]; then
    print_error "backend/.env file not found!"
    exit 1
fi

if [ ! -f "backend/.env.production" ]; then
    print_warning "backend/.env.production not found. Creating from .env..."
    cp backend/.env backend/.env.production
    print_success "Created backend/.env.production"
fi

# Check for required Firebase variables
if ! grep -q "FIREBASE_PROJECT_ID" backend/.env; then
    print_error "Firebase not configured in backend/.env"
    exit 1
fi
print_success "Backend configuration verified"
echo ""

# Step 4: Frontend Verification
echo "Step 4: Verifying frontend files..."
if [ ! -f "frontend/index.html" ] || [ ! -f "frontend/app.js" ] || [ ! -f "frontend/map.js" ]; then
    print_error "Some frontend files are missing!"
    exit 1
fi
print_success "Frontend files verified"
echo ""

# Step 5: Summary and Deployment Instructions
echo "=========================================="
echo "✓ Project is ready for deployment!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Deploy Frontend to Netlify:"
echo "   Option A (GitHub): Push to GitHub, Netlify will auto-deploy"
echo "   Option B (CLI):    netlify deploy --prod"
echo ""
echo "2️⃣  Deploy Backend to Render:"
echo "   - Go to https://render.com"
echo "   - Create Web Service from GitHub"
echo "   - Build command: cd backend && npm install"
echo "   - Start command: cd backend && npm start"
echo "   - Add secret file: backend/.env.production"
echo ""
echo "3️⃣  Update Frontend with Backend URL:"
echo "   - Get your Render URL (e.g., https://your-backend.onrender.com)"
echo "   - Update netlify.toml with backend URL"
echo "   - Push to GitHub (auto-redeploy)"
echo ""
echo "4️⃣  Verify Deployment:"
echo "   - Frontend: https://your-site.netlify.app"
echo "   - Backend: https://your-backend.onrender.com/api/health"
echo ""
echo "For detailed instructions, see: NETLIFY_DEPLOYMENT.md"
echo "For quick start, see: NETLIFY_QUICK_START.md"
echo ""
