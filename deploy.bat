@echo off
setlocal enabledelayedexpansion
title BAFS - Production Deployment
color 0B

echo ===============================================================================
echo     BIRDAWADE ASSOCIATES ^& FINANCIAL SERVICES (BAFS) - PRODUCTION DEPLOY
echo ===============================================================================
echo.

cd /d "%~dp0"

:: 1. Check Docker
echo [1/5] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH!
    echo Please install Docker Desktop for Windows or run on a Docker host.
    pause
    exit /b 1
)
echo       [OK] Docker is installed.

:: 2. Check .env.production
echo [2/5] Checking .env.production configuration...
if not exist ".env.production" (
    if exist ".env.production.example" (
        copy ".env.production.example" ".env.production" >nul
        echo       [!] Created .env.production from template.
        echo       [ACTION REQUIRED] Please edit .env.production with your real secrets!
        notepad ".env.production"
        pause
    ) else (
        echo [ERROR] .env.production.example not found!
        pause
        exit /b 1
    )
)
echo       [OK] .env.production found.

:: 3. Create SSL directory
if not exist "nginx\ssl" mkdir "nginx\ssl"

:: 4. Build Docker Production Images
echo [3/5] Building production Docker images...
docker compose -f docker-compose.prod.yml --env-file .env.production build
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)

:: 5. Launch Production Stack
echo [4/5] Launching production containers with migrations...
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start production containers!
    pause
    exit /b 1
)

:: 6. Status
echo [5/5] Checking status...
timeout /t 5 >nul
docker compose -f docker-compose.prod.yml ps

echo.
echo ===============================================================================
echo   [SUCCESS] BAFS Production Stack is running!
echo ===============================================================================
echo   * Web Application:  http://localhost
echo   * Backend Health:   http://localhost/health
echo   * View Logs:        docker compose -f docker-compose.prod.yml logs -f
echo   * Stop Stack:       docker compose -f docker-compose.prod.yml down
echo ===============================================================================
echo.
pause
