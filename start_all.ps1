Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting All ChronoSense Services (Frontend, Backend, CV Engine)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

Write-Host "[1/3] Starting Main Backend API (Port 8001)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$rootDir\backend`" && python -m uvicorn main:app --port 8001 --reload"

Write-Host "[2/3] Starting CV Engine Web Server (Port 8002)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$rootDir\cv_engine`" && python app.py"

Write-Host "[3/3] Starting Frontend Dashboard (Port 3000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$rootDir\frontend`" && npm run dev"

Write-Host ""
Write-Host "Waiting 5 seconds for servers to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "Opening Frontend at http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"
Start-Process "http://127.0.0.1:8001/docs"
Start-Process "http://127.0.0.1:8002/"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  ALL SERVICES STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  - Frontend UI:       http://localhost:3000" -ForegroundColor Green
Write-Host "  - Backend API Docs:  http://127.0.0.1:8001/docs" -ForegroundColor Green
Write-Host "  - CV Engine UI:      http://127.0.0.1:8002/" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
