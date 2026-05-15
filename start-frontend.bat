@echo off
echo Starting WeatherSphere Frontend Server...
cd /d "C:\Users\Jnanendravarma927\Downloads\weather\public"
echo Serving from: %CD%
echo Open your browser at http://localhost:8080
python -m http.server 8080