@echo off
REM ========================================
REM RENDER DEPLOYMENT SETUP SCRIPT (Windows)
REM ========================================
REM This script prepares the application for Render deployment

echo.
echo 🚀 Starting Render Deployment Setup...
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm not found. Please install npm first.
    exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
    echo ❌ Git not found. Please install Git first.
    exit /b 1
)

echo ✓ Prerequisites OK
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo   Node version: %NODE_VER%
echo   npm version: %NPM_VER%
echo.

REM Setup backend
echo 🔧 Setting up backend...
cd backend
echo   📦 Installing dependencies...
call npm install --production
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    cd ..
    exit /b 1
)
echo   ✓ Backend ready
cd ..

REM Create environment file
echo.
echo 📝 Creating environment files...

if not exist ".env.production" (
    (
        echo NODE_ENV=production
        echo PORT=10000
        echo OPENROUTE_ENABLED=true
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo LOG_LEVEL=info
    ) > .env.production
    echo   ✓ Created .env.production
) else (
    echo   ✓ .env.production already exists
)

REM Create build info
echo.
echo 📊 Creating deployment info...
(
    echo ===========================================
    echo RENDER DEPLOYMENT INFORMATION
    echo ===========================================
    echo.
    echo Generated: %date% %time%
    echo Application: Interactive Map Time Estimation System
    echo Status: Ready for Render deployment
    echo.
    echo KEY URLS ^(after deployment^):
    echo - Frontend: https://navigator-frontend.onrender.com
    echo - Backend: https://navigator-backend.onrender.com
    echo - API Health: https://navigator-backend.onrender.com/api/health
    echo.
    echo DEPLOYMENT STEPS:
    echo 1. Push this code to GitHub
    echo 2. Connect GitHub repository to Render
    echo 3. Deploy backend as Web Service
    echo 4. Deploy frontend as Static Site
    echo 5. Test API endpoints
    echo.
    echo ENVIRONMENT VARIABLES ^(automatically set^):
    echo ✓ NODE_ENV = production
    echo ✓ PORT = 10000
    echo ✓ OPENROUTE_ENABLED = true
    echo ✓ Rate limiting enabled
    echo ✓ CORS configured for Render
    echo.
    echo FEATURES INCLUDED:
    echo ✓ Interactive map ^(Leaflet.js^)
    echo ✓ Real-time location detection
    echo ✓ Time estimation calculations
    echo ✓ Rate limiting ^& security
    echo ✓ Health check endpoints
    echo ✓ Comprehensive error handling
    echo ✓ Mobile responsive design
    echo.
    echo SUPPORTED SERVICES:
    echo ✓ OpenRouteService ^(free, no key needed^)
    echo ✓ Firebase Firestore ^(optional^)
    echo ✓ Google Maps API ^(optional^)
    echo.
    echo NO EXTERNAL PAID SERVICES REQUIRED FOR BASIC FUNCTIONALITY
    echo.
    echo For detailed instructions, see RENDER_DEPLOYMENT.md
    echo ===========================================
) > DEPLOYMENT_INFO.txt

echo   ✓ Created deployment info

REM Check git
echo.
echo 📤 Git operations...

git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo   ⚠️  Not a git repository. Please initialize git:
    echo      git init
    echo      git add .
    echo      git commit -m "Initial commit"
    echo      git branch -M main
    echo      git remote add origin ^<your-github-url^>
    echo      git push -u origin main
) else (
    echo   ✓ Git repository found
    echo.
    echo 📋 Modified files:
    git status --short | findstr /r "^"
    echo.
    echo 📋 Next steps:
    echo   1. Review changes: git status
    echo   2. Stage changes: git add .
    echo   3. Commit: git commit -m "Setup Render deployment"
    echo   4. Push: git push origin main
    echo   5. Connect to Render Dashboard
)

echo.
echo ✅ Render deployment setup complete!
echo.
echo 📚 For detailed instructions, see RENDER_DEPLOYMENT.md
echo.
pause
