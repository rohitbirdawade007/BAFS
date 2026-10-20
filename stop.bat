@echo off
setlocal enabledelayedexpansion
title BAFS - Stopping Services
color 0C

echo ===============================================================================
echo       BIRDAWADE ASSOCIATES ^& FINANCIAL SERVICES (BAFS) - STOP SERVICES
echo ===============================================================================
echo.

set "STOPPED=0"

:: ── Terminate processes on port 3000 (Frontend) ──────────────────────────────
echo [1/2] Checking port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo       - Stopping process with PID %%a on port 3000...
    taskkill /f /pid %%a >nul 2>&1
    set "STOPPED=1"
)

:: ── Terminate processes on port 8000 (Backend) ───────────────────────────────
echo [2/2] Checking port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo       - Stopping process with PID %%a on port 8000...
    taskkill /f /pid %%a >nul 2>&1
    set "STOPPED=1"
)

echo.
echo ===============================================================================
if "!STOPPED!"=="1" (
    color 0A
    echo   [SUCCESS] All BAFS server processes have been stopped!
) else (
    color 0E
    echo   [INFO] No active services were found running on ports 3000 or 8000.
)
echo ===============================================================================
echo.

:: If run with --no-pause, exit without waiting
if "%~1"=="--no-pause" goto :eof

echo Press any key to close this window...
pause >nul
