# ========================================
# RENDER-SPECIFIC BUILD SCRIPT
# ========================================
# For Node.js backends on Render

set -e

echo "🏗️  Build Script Started"
echo "Environment: $NODE_ENV"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

# Build backend
echo ""
echo "📦 Building backend..."
cd backend

# Clean install for production
npm ci --production 2>/dev/null || npm install --production

# Verify dependencies
echo "✓ Dependencies installed"

# Run any build tasks (if needed)
if [ -f "build.js" ]; then
    echo "Running build.js..."
    node build.js
fi

cd ..

echo ""
echo "✅ Build complete!"
echo ""
echo "Service is ready to start with: npm start"
