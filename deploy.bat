@echo off
REM Netlify + Render Deployment Script for Windows
REM This script helps you deploy your application to production

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo 🚀 Offline Map - Production Deployment Script
echo =============================================
echo.

REM Check if Git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Git is not installed. Please install Git first.
    exit /b 1
)

REM Step 1: Verify Project Structure
echo Step 1: Verifying project structure...
if not exist "frontend\" (
    echo ✗ frontend folder not found!
    exit /b 1
)
if not exist "backend\" (
    echo ✗ backend folder not found!
    exit /b 1
)
if not exist "netlify.toml" (
    echo ✗ netlify.toml not found!
    exit /b 1
)
echo ✓ Project structure verified
echo.

REM Step 2: Check Git Status
echo Step 2: Checking Git status...
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ⚠ Not a Git repository. You may need to initialize Git first.
    echo   Run: git init
) else (
    git status --porcelain >nul 2>&1
    if errorlevel 1 (
        echo ✓ All changes tracked by Git
    ) else (
        echo ⚠ You have uncommitted changes
        echo   Run: git status
    )
)
echo.

REM Step 3: Verify Backend Configuration
echo Step 3: Verifying backend configuration...
if not exist "backend\.env" (
    echo ✗ backend\.env file not found!
    exit /b 1
)
findstr /M "FIREBASE_PROJECT_ID" backend\.env >nul
if errorlevel 1 (
    echo ✗ Firebase not configured in backend\.env
    exit /b 1
)
echo ✓ Backend configuration verified
echo.

REM Step 4: Frontend Verification
echo Step 4: Verifying frontend files...
if not exist "frontend\index.html" (
    echo ✗ frontend\index.html not found!
    exit /b 1
)
if not exist "frontend\app.js" (
    echo ✗ frontend\app.js not found!
    exit /b 1
)
if not exist "frontend\map.js" (
    echo ✗ frontend\map.js not found!
    exit /b 1
)
echo ✓ Frontend files verified
echo.

REM Step 5: Summary and Deployment Instructions
echo ==========================================
echo ✓ Project is ready for deployment!
echo ==========================================
echo.
echo Next steps:
echo.
echo 1️⃣  Deploy Frontend to Netlify:
echo    Option A (GitHub): Push to GitHub, Netlify will auto-deploy
echo    Option B (CLI):    netlify deploy --prod
echo.
echo 2️⃣  Deploy Backend to Render:
echo    - Go to https://render.com
echo    - Create Web Service from GitHub
echo    - Build command: cd backend ^&^& npm install
echo    - Start command: cd backend ^&^& npm start
echo    - Add secret file: backend\.env.production
echo.
echo 3️⃣  Update Frontend with Backend URL:
echo    - Get your Render URL (e.g., https://your-backend.onrender.com)
echo    - Update netlify.toml with backend URL
echo    - Push to GitHub (auto-redeploy)
echo.
echo 4️⃣  Verify Deployment:
echo    - Frontend: https://your-site.netlify.app
echo    - Backend: https://your-backend.onrender.com/api/health
echo.
echo For detailed instructions, see: NETLIFY_DEPLOYMENT.md
echo For quick start, see: NETLIFY_QUICK_START.md
echo.

pause
