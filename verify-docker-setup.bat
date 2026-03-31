@echo off
REM ========================================
REM DOCKER SETUP VERIFICATION SCRIPT
REM For Windows PowerShell/CMD
REM ========================================

echo.
echo ========================================
echo  DOCKER SETUP DIAGNOSTIC
echo ========================================
echo.

REM Check current directory
echo 1. Checking current directory...
cd
if exist docker-compose.yml (
    echo    ✓ docker-compose.yml found
) else (
    echo    ✗ docker-compose.yml NOT found
    echo    → Navigate to: C:\Users\Samragya\OneDrive\Documents\GitHub\offline_map\Navigator
)

REM Check Dockerfile
echo.
echo 2. Checking Dockerfile...
if exist backend\Dockerfile (
    echo    ✓ backend/Dockerfile exists
) else (
    echo    ✗ backend/Dockerfile NOT found
)

REM Check package.json
echo.
echo 3. Checking package.json...
if exist backend\package.json (
    echo    ✓ backend/package.json exists
) else (
    echo    ✗ backend/package.json NOT found
)

REM Check Docker installation
echo.
echo 4. Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker --version') do set VERSION=%%i
    echo    ✓ Docker installed: %VERSION%
) else (
    echo    ✗ Docker NOT installed or not in PATH
    echo    → Install from: https://docker.com/products/docker-desktop
)

REM Check Docker daemon
echo.
echo 5. Checking Docker daemon...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ Docker daemon running
) else (
    echo    ✗ Docker daemon NOT running
    echo    → Start Docker Desktop application
)

REM Check Docker Compose
echo.
echo 6. Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker-compose --version') do set COMPOSE_VER=%%i
    echo    ✓ Docker Compose installed: %COMPOSE_VER%
) else (
    echo    ✗ Docker Compose NOT installed or not in PATH
)

REM Check ports
echo.
echo 7. Checking ports...
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ⚠ Port 5000 already in use
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5000') do set PID=%%i
    echo    → Process ID: !PID!
) else (
    echo    ✓ Port 5000 available
)

netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ⚠ Port 3000 already in use
) else (
    echo    ✓ Port 3000 available
)

REM Summary
echo.
echo ========================================
echo  SUMMARY
echo ========================================
echo.

if exist docker-compose.yml (
    if exist backend\Dockerfile (
        if exist backend\package.json (
            docker ps >nul 2>&1
            if %errorlevel% equ 0 (
                echo ✅ All systems ready!
                echo.
                echo Ready to run:
                echo   docker-compose up -d
                echo.
            ) else (
                echo ⚠️  Start Docker Desktop first, then run:
                echo   docker-compose up -d
            )
        ) else (
            echo ❌ Missing backend/package.json
        )
    ) else (
        echo ❌ Missing backend/Dockerfile
    )
) else (
    echo ❌ Wrong directory!
    echo    Navigate to: C:\Users\Samragya\OneDrive\Documents\GitHub\offline_map\Navigator
    echo.
    echo    Then run this script again
)

echo.
echo ========================================
echo.
pause
