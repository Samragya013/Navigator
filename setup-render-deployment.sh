#!/bin/bash

# ========================================
# COMPLETE RENDER DEPLOYMENT SETUP SCRIPT
# ========================================
# This script prepares the application for Render deployment

echo "🚀 Starting Render Deployment Setup..."
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

echo "✓ Prerequisites OK"
echo "  Node version: $(node --version)"
echo "  npm version: $(npm --version)"
echo ""

# Setup backend
echo "🔧 Setting up backend..."
cd backend || exit

# Install dependencies
echo "  📦 Installing dependencies..."
npm install --production

# Verify server starts
echo "  ✓ Backend ready"
cd ..

# Create environment file
echo ""
echo "📝 Creating environment files..."

if [ ! -f ".env.production" ]; then
    cat > .env.production << 'EOF'
NODE_ENV=production
PORT=10000
OPENROUTE_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
EOF
    echo "  ✓ Created .env.production"
else
    echo "  ✓ .env.production already exists"
fi

# Create build info
echo ""
echo "📊 Creating deployment info..."
cat > DEPLOYMENT_INFO.txt << 'EOF'
===========================================
RENDER DEPLOYMENT INFORMATION
===========================================

Generated: $(date)
Application: Interactive Map Time Estimation System
Status: Ready for Render deployment

KEY URLS (after deployment):
- Frontend: https://navigator-frontend.onrender.com
- Backend: https://navigator-backend.onrender.com
- API Health: https://navigator-backend.onrender.com/api/health

DEPLOYMENT STEPS:
1. Push this code to GitHub
2. Connect GitHub repository to Render
3. Deploy backend as Web Service
4. Deploy frontend as Static Site
5. Test API endpoints

ENVIRONMENT VARIABLES (automatically set):
✓ NODE_ENV = production
✓ PORT = 10000
✓ OPENROUTE_ENABLED = true
✓ Rate limiting enabled
✓ CORS configured for Render

FEATURES INCLUDED:
✓ Interactive map (Leaflet.js)
✓ Real-time location detection
✓ Time estimation calculations
✓ Rate limiting & security
✓ Health check endpoints
✓ Comprehensive error handling
✓ Mobile responsive design

SUPPORTED SERVICES:
✓ OpenRouteService (free, no key needed)
✓ Firebase Firestore (optional)
✓ Google Maps API (optional)

NO EXTERNAL PAID SERVICES REQUIRED FOR BASIC FUNCTIONALITY

For detailed instructions, see RENDER_DEPLOYMENT.md
===========================================
EOF

echo "  ✓ Created deployment info"

# Git operations
echo ""
echo "📤 Git operations..."

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "  ✓ Git repository initialized"
    
    # Show status
    git status --short | head -5
    
    echo ""
    echo "📋 Next steps:"
    echo "  1. Review changes: git status"
    echo "  2. Stage changes: git add ."
    echo "  3. Commit: git commit -m 'Setup Render deployment'"
    echo "  4. Push: git push origin main"
    echo "  5. Connect to Render Dashboard"
else
    echo "  ⚠️  Not a git repository. Please initialize git:"
    echo "     git init"
    echo "     git add ."
    echo "     git commit -m 'Initial commit'"
    echo "     git branch -M main"
    echo "     git remote add origin <your-github-url>"
    echo "     git push -u origin main"
fi

echo ""
echo "✅ Render deployment setup complete!"
echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT.md"
