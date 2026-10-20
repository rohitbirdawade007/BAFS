@echo off
setlocal enabledelayedexpansion
title BAFS - Platform Launcher
color 0B

:: Ensure working directory is the repository root
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: ─────────────────────────────────────────────────────────────────────────────
:: Command-line argument shortcuts (e.g. run.bat backend, run.bat frontend)
:: ─────────────────────────────────────────────────────────────────────────────
if /i "%~1"=="backend" goto :start_backend
if /i "%~1"=="frontend" goto :start_frontend
if /i "%~1"=="stop" (
    call "%ROOT_DIR%stop.bat" %2 %3
    exit /b 0
)
if /i "%~1"=="install" goto :install_dependencies
if /i "%~1"=="db" goto :init_db
if /i "%~1"=="all" goto :start_all

:menu
cls
echo ===============================================================================
echo       BIRDAWADE ASSOCIATES ^& FINANCIAL SERVICES (BAFS)
echo       Loan Consultancy ^& DSA Management Platform
echo ===============================================================================
echo.
echo   [1] Start Both Frontend ^& Backend (Recommended - Press ENTER)
echo   [2] Start Frontend Only     (Next.js Turbopack  - http://localhost:3000)
echo   [3] Start Backend Only      (FastAPI + Uvicorn  - http://localhost:8000)
echo   [4] Initialize Database     (Create / Sync Database Tables)
echo   [5] Install Dependencies    (Python requirements ^& npm packages)
echo   [6] Stop All Running Servers(Free ports 3000 ^& 8000)
echo   [7] Exit
echo.
echo ===============================================================================

set "CHOICE="
set /p "CHOICE=Select an option [1-7] (Default: 1): "
if not defined CHOICE set "CHOICE=1"
set "CHOICE=%CHOICE: =%"

if "%CHOICE%"=="1" goto :start_all
if "%CHOICE%"=="2" goto :start_frontend
if "%CHOICE%"=="3" goto :start_backend
if "%CHOICE%"=="4" goto :init_db
if "%CHOICE%"=="5" goto :install_dependencies
if "%CHOICE%"=="6" goto :stop_services
if "%CHOICE%"=="7" goto :exit_launcher

echo.
echo [ERROR] Invalid selection "%CHOICE%". Please enter a number from 1 to 7.
timeout /t 2 >nul
goto :menu


:: ─────────────────────────────────────────────────────────────────────────────
:: Pre-flight System & Environment Checks
:: ─────────────────────────────────────────────────────────────────────────────
:preflight_checks
echo.
echo [*] Checking environment prerequisites...

:: 1. Check Python and Virtual Environment
set "PY_EXEC="
set "VENV_ACTIVATE="

if exist "%ROOT_DIR%backend\venv\Scripts\activate.bat" set "VENV_ACTIVATE=%ROOT_DIR%backend\venv\Scripts\activate.bat"
if not defined VENV_ACTIVATE if exist "%ROOT_DIR%backend\.venv\Scripts\activate.bat" set "VENV_ACTIVATE=%ROOT_DIR%backend\.venv\Scripts\activate.bat"
if not defined VENV_ACTIVATE if exist "%ROOT_DIR%venv\Scripts\activate.bat" set "VENV_ACTIVATE=%ROOT_DIR%venv\Scripts\activate.bat"
if not defined VENV_ACTIVATE if exist "%ROOT_DIR%.venv\Scripts\activate.bat" set "VENV_ACTIVATE=%ROOT_DIR%.venv\Scripts\activate.bat"

if defined VENV_ACTIVATE (
    set "PY_EXEC=python"
    echo   [OK] Detected virtual environment: !VENV_ACTIVATE!
) else (
    where python >nul 2>&1
    if !errorlevel! equ 0 (
        set "PY_EXEC=python"
        echo   [OK] Using system Python
    ) else (
        where py >nul 2>&1
        if !errorlevel! equ 0 (
            set "PY_EXEC=py"
            echo   [OK] Using Python Launcher (py)
        ) else (
            echo   [ERROR] Python is not installed or not in PATH!
            echo           Please install Python 3.10+ from https://www.python.org/
            pause
            goto :menu
        )
    )
)

:: 2. Check Node.js and npm
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo   [ERROR] Node.js is not found in PATH!
    echo           Please install Node.js (v18+) from https://nodejs.org/
    pause
    goto :menu
)
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo   [ERROR] npm is not found in PATH!
    pause
    goto :menu
)
echo   [OK] Node.js and npm detected

:: 3. Check Root .env
if not exist "%ROOT_DIR%.env" (
    if exist "%ROOT_DIR%.env.example" (
        echo   [*] Creating .env from .env.example...
        copy "%ROOT_DIR%.env.example" "%ROOT_DIR%.env" >nul
        echo   [OK] .env configuration file created.
    ) else (
        echo   [WARNING] .env and .env.example not found!
    )
) else (
    echo   [OK] .env configuration file found
)

:: 4. Check Frontend .env.local
if not exist "%ROOT_DIR%frontend\.env.local" (
    echo   [*] Creating frontend\.env.local...
    (
        echo # Local frontend environment configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
        echo NEXT_PUBLIC_APP_NAME="Birdawade Associates & Financial Services"
        echo NEXT_PUBLIC_SUPPORT_EMAIL=support@birdawade.com
        echo NEXT_PUBLIC_SUPPORT_PHONE=+91-XXXXXXXXXX
    ) > "%ROOT_DIR%frontend\.env.local"
    echo   [OK] frontend\.env.local created.
)

:: 5. Check Frontend node_modules
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo   [!] frontend\node_modules not found. Running npm install now...
    cd /d "%ROOT_DIR%frontend" && call npm install
    cd /d "%ROOT_DIR%"
)

goto :eof


:: ─────────────────────────────────────────────────────────────────────────────
:: Action: Start Both Services (Frontend + Backend)
:: ─────────────────────────────────────────────────────────────────────────────
:start_all
call :preflight_checks

:: Check for existing instances on ports and stop them to prevent conflicts
set "CONFLICT=0"
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do set "CONFLICT=1"
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do set "CONFLICT=1"

if "!CONFLICT!"=="1" (
    echo.
    echo [*] Clearing existing processes running on ports 3000 / 8000...
    call "%ROOT_DIR%stop.bat" --no-pause
)

echo.
echo [*] Launching FastAPI Backend on http://localhost:8000...
if defined VENV_ACTIVATE (
    start "BAFS Backend (Port 8000)" cmd.exe /k "cd /d ""%ROOT_DIR%backend"" && title BAFS Backend (Port 8000) && color 0A && call ""%VENV_ACTIVATE%"" && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
) else (
    start "BAFS Backend (Port 8000)" cmd.exe /k "cd /d ""%ROOT_DIR%backend"" && title BAFS Backend (Port 8000) && color 0A && %PY_EXEC% -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
)

echo [*] Launching Next.js Frontend on http://localhost:3000...
start "BAFS Frontend (Port 3000)" cmd.exe /k "cd /d ""%ROOT_DIR%frontend"" && title BAFS Frontend (Port 3000) && color 0B && npm run dev"

cls
echo ===============================================================================
echo       BIRDAWADE ASSOCIATES ^& FINANCIAL SERVICES (BAFS) - RUNNING
echo ===============================================================================
echo.
echo   [OK] Services launched successfully in dedicated terminal windows!
echo.
echo   -----------------------------------------------------------------------------
echo     * Frontend Web Application:   http://localhost:3000
echo     * Backend API Root:           http://localhost:8000
echo     * Interactive API Docs:       http://localhost:8000/api/docs
echo     * Alternative ReDoc:          http://localhost:8000/api/redoc
echo     * Health Check Endpoint:      http://localhost:8000/health
echo   -----------------------------------------------------------------------------
echo.
echo   [*] Opening http://localhost:3000 in your default browser...
timeout /t 3 /nobreak >nul 2>&1
start http://localhost:3000

:running_loop
echo.
echo   =============================================================================
echo     Quick Actions:
echo       [S] Stop all services and return to menu
echo       [R] Restart all services
echo       [O] Re-open Frontend (http://localhost:3000)
echo       [D] Open API Documentation (http://localhost:8000/api/docs)
echo       [Q] Exit launcher (services will keep running)
echo   =============================================================================
echo.
set "ACT="
set /p "ACT=Enter action [S/R/O/D/Q]: "

if /i "%ACT%"=="S" (
    call "%ROOT_DIR%stop.bat" --no-pause
    goto :menu
)
if /i "%ACT%"=="R" (
    call "%ROOT_DIR%stop.bat" --no-pause
    goto :start_all
)
if /i "%ACT%"=="O" (
    start http://localhost:3000
    goto :running_loop
)
if /i "%ACT%"=="D" (
    start http://localhost:8000/api/docs
    goto :running_loop
)
if /i "%ACT%"=="Q" (
    goto :eof
)
goto :running_loop


:: ─────────────────────────────────────────────────────────────────────────────
:: Action: Start Frontend Only
:: ─────────────────────────────────────────────────────────────────────────────
:start_frontend
call :preflight_checks
echo.
echo [*] Launching Next.js Frontend on http://localhost:3000...
start "BAFS Frontend (Port 3000)" cmd.exe /k "cd /d ""%ROOT_DIR%frontend"" && title BAFS Frontend (Port 3000) && color 0B && npm run dev"
timeout /t 2 /nobreak >nul 2>&1
start http://localhost:3000
echo   [OK] Frontend started!
echo Press any key to return to menu...
pause >nul
goto :menu


:: ─────────────────────────────────────────────────────────────────────────────
:: Action: Start Backend Only
:: ─────────────────────────────────────────────────────────────────────────────
:start_backend
call :preflight_checks
echo.
echo [*] Launching FastAPI Backend on http://localhost:8000...
if defined VENV_ACTIVATE (
    start "BAFS Backend (Port 8000)" cmd.exe /k "cd /d ""%ROOT_DIR%backend"" && title BAFS Backend (Port 8000) && color 0A && call ""%VENV_ACTIVATE%"" && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
) else (
    start "BAFS Backend (Port 8000)" cmd.exe /k "cd /d ""%ROOT_DIR%backend"" && title BAFS Backend (Port 8000) && color 0A && %PY_EXEC% -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
)
timeout /t 2 /nobreak >nul 2>&1
start http://localhost:8000/api/docs
echo   [OK] Backend started!
echo Press any key to return to menu...
pause >nul
goto :menu


:: ─────────────────────────────────────────────────────────────────────────────
:: Action: Initialize Database Tables
:: ─────────────────────────────────────────────────────────────────────────────
:init_db
call :preflight_checks
echo.
echo ===============================================================================
echo   Initializing Database Tables via SQLAlchemy Models...
echo ===============================================================================
if defined VENV_ACTIVATE (
    call "%VENV_ACTIVATE%"
)
%PY_EXEC% "%ROOT_DIR%backend\scripts\init_db.py"
echo.
echo Press any key to return to menu...
pause >nul
goto :menu


:: ─────────────────────────────────────────────────────────────────────────────
:: Action: Install / Update Dependencies
:: ─────────────────────────────────────────────────────────────────────────────
:install_dependencies
call :preflight_checks
echo.
echo ===============================================================================
echo   [1/2] Installing / Updating Backend Python Dependencies...
echo ===============================================================================
if defined VENV_ACTIVATE (
    call "%VENV_ACTIVATE%"
)
%PY_EXEC% -m pip install --upgrade pip
%PY_EXEC% -m pip install -r "%ROOT_DIR%backend\requirements.txt"

echo.
echo ===============================================================================
echo   [2/2] Installing / Updating Frontend npm Dependencies...
echo ===============================================================================
cd /d "%ROOT_DIR%frontend"
call npm install
cd /d "%ROOT_DIR%"

echo.
echo [SUCCESS] All dependencies have been updated!
echo Press any key to return to menu...
pause >nul
goto :menu


:: ─────────────────────────────────────────────────────────────────────────────
:: Action: Stop Services
:: ─────────────────────────────────────────────────────────────────────────────
:stop_services
call "%ROOT_DIR%stop.bat"
goto :menu

:exit_launcher
exit /b 0
