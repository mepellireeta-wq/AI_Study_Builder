@echo off
title Starting ChronoSense AI Study Builder...
echo ========================================================
echo   Starting All ChronoSense Services (Frontend, Backend, CV Engine)
echo ========================================================
echo.

set ROOT_DIR=%~dp0

echo [1/3] Starting Main Backend API (Port 8001)...
start "ChronoSense Backend API" cmd /k "cd /d %ROOT_DIR%backend && python -m uvicorn main:app --port 8001 --reload"

echo [2/3] Starting CV Engine API (Port 8002)...
start "ChronoSense CV Engine" cmd /k "cd /d %ROOT_DIR%cv_engine && python -m uvicorn app:app --port 8002 --reload"

echo [3/3] Starting Frontend Dashboard (Port 3000)...
start "ChronoSense Frontend UI" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

echo.
echo Waiting 5 seconds for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000
start http://127.0.0.1:8001/docs

echo.
echo ========================================================
echo   ALL SERVICES STARTED SUCCESSFULLY!
echo   - Frontend UI:       http://localhost:3000
echo   - Backend API Docs:  http://127.0.0.1:8001/docs
echo   - CV Engine Docs:    http://127.0.0.1:8002/docs
echo ========================================================
