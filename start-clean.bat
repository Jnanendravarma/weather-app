@echo off
echo ==========================================
echo    WeatherSphere - Clean Startup Script
echo ==========================================

echo.
echo 🔄 Stopping any existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo ✅ Processes stopped
echo.

echo 🚀 Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "WeatherSphere Backend" cmd /k "node server.js"

echo ⏳ Waiting for backend to start...
timeout /t 3 >nul

echo 🌐 Starting Frontend Server (Port 8080)...
cd /d "%~dp0frontend"
start "WeatherSphere Frontend" cmd /k "python -m http.server 8080"

echo ⏳ Waiting for frontend to start...
timeout /t 2 >nul

echo.
echo ✅ Both servers are starting up!
echo 📱 Frontend: http://localhost:8080
echo 🔧 Backend API: http://localhost:5000
echo.
echo Press any key to open the weather app...
pause >nul

start http://localhost:8080

echo.
echo 🎉 WeatherSphere is now running!
echo Press any key to exit this launcher...
pause >nul