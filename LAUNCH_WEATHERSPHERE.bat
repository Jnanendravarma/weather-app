@echo off
echo ================================
echo   🌦️  WeatherSphere Launcher   
echo ================================
echo.
echo Starting servers...
echo.

echo [1/2] Starting Backend Server...
start "WeatherSphere Backend" cmd /k "cd /d C:\Users\Jnanendravarma927\Downloads\weather\backend && echo Backend starting... && node server.js"

echo [2/2] Starting Frontend Server...
timeout /t 3 /nobreak > nul
start "WeatherSphere Frontend" cmd /k "cd /d C:\Users\Jnanendravarma927\Downloads\weather\frontend && echo Frontend starting... && python -m http.server 8080"

echo.
echo ✅ Servers are starting...
echo.
echo 🌐 Frontend: http://localhost:8080
echo 🔌 Backend:  http://localhost:5000/api
echo 📊 Status:   http://localhost:8080/status.html
echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 🚀 Opening WeatherSphere in your browser...
start http://localhost:8080

echo.
echo ================================
echo   WeatherSphere is now LIVE!   
echo ================================
echo.
echo Press any key to exit launcher...
pause > nul