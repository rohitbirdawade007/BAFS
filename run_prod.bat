@echo off
setlocal enabledelayedexpansion
title BAFS - Production Mode Runner
color 0A

:: Ensure working directory is the repository root
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo ===============================================================================
echo     BIRDAWADE ASSOCIATES ^& FINANCIAL SERVICES (BAFS) - LOCAL PROD RUNNER
echo ===============================================================================
echo.
echo [*] Checking for production build...
if not exist "%ROOT_DIR%frontend\.next\standalone\server.js" (
    echo [!] Frontend production build not found. Building now (npm run build)...
    cd /d "%ROOT_DIR%frontend" && call npm run build
    cd /d "%ROOT_DIR%"
)

:: Clear existing ports
call "%ROOT_DIR%stop.bat" --no-pause

:: Start Backend in production mode (multiple workers)
echo.
echo [*] Starting FastAPI Backend (4 Workers, Production Mode)...
set "PY_EXEC=python"
if exist "%ROOT_DIR%backend\venv\Scripts\activate.bat" (
    start "BAFS Backend [PROD] (Port 8000)" cmd.exe /k "cd /d ""%ROOT_DIR%backend"" && title BAFS Backend [PROD] && color 0A && call ""%ROOT_DIR%backend\venv\Scripts\activate.bat"" && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"
) else (
    start "BAFS Backend [PROD] (Port 8000)" cmd.exe /k "cd /d ""%ROOT_DIR%backend"" && title BAFS Backend [PROD] && color 0A && %PY_EXEC% -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"
)

:: Start Frontend in production mode
echo [*] Starting Next.js Frontend (Production Standalone Server)...
start "BAFS Frontend [PROD] (Port 3000)" cmd.exe /k "cd /d ""%ROOT_DIR%frontend"" && title BAFS Frontend [PROD] && color 0B && set NODE_ENV=production && npm run start"

cls
echo ===============================================================================
echo     BAFS RUNNING IN PRODUCTION MODE!
echo ===============================================================================
echo.
echo   * Frontend Web App:   http://localhost:3000
echo   * Backend API:        http://localhost:8000
echo   * Health Check:       http://localhost:8000/health
echo.
echo ===============================================================================
echo   Press any key to stop all services...
echo ===============================================================================
pause >nul

call "%ROOT_DIR%stop.bat" --no-pause
