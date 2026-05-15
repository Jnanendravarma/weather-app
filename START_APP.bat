@echo off
title WeatherSphere
echo =============================================
echo   WeatherSphere - Starting Server
echo =============================================
echo.
echo Starting backend server (serves app + API)...
start "WeatherSphere Server" cmd /k "cd /d C:\Users\Jnanendravarma927\Downloads\weather\backend && node server.js"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo =============================================
echo   App is running at: http://localhost:5000
echo =============================================
echo.
echo Opening browser...
start "" "http://localhost:5000"
echo.
echo Done! Close the "WeatherSphere Server" window to stop.
pause
