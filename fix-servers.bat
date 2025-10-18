@echo off
echo ==========================================
echo    FIXING BACKEND & FRONTEND ISSUES
echo ==========================================

echo.
echo 🔄 Killing any existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo ✅ All processes stopped
echo.

echo 🔧 Starting Backend Server...
echo Current directory: %CD%
cd /d "%~dp0backend"
echo Backend directory: %CD%

if not exist "server.js" (
    echo ❌ ERROR: server.js not found in backend directory!
    echo Directory contents:
    dir
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ ERROR: package.json not found in backend directory!
    pause
    exit /b 1
)

echo ✅ Files verified, starting server...
start "Backend Server" cmd /k "node server.js"

echo ⏳ Waiting 3 seconds for backend...
timeout /t 3 >nul

echo.
echo 🌐 Starting Frontend Server...
cd /d "%~dp0frontend"
echo Frontend directory: %CD%

if not exist "index.html" (
    echo ❌ ERROR: index.html not found in frontend directory!
    echo Directory contents:
    dir
    pause
    exit /b 1
)

echo ✅ Frontend files verified, starting server...
start "Frontend Server" cmd /k "python -m http.server 8080"

echo ⏳ Waiting 3 seconds for frontend...
timeout /t 3 >nul

echo.
echo 🧪 Testing connections...
echo Testing backend health...
curl -s http://localhost:5000/api/health

echo.
echo ✅ Servers should be running!
echo 🌐 Frontend: http://localhost:8080
echo 🔧 Backend: http://localhost:5000/api/health

echo.
echo Opening weather app...
start http://localhost:8080

echo.
echo Press any key to exit...
pause >nul