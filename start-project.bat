@echo off
echo ===================================================
echo   StaySphere Luxury Hotel Booking - Startup Script
echo ===================================================
echo.

:: Start Backend
echo Starting StaySphere Backend (Tomcat on port 8080)...
if "%MONGODB_URI%"=="" set MONGODB_URI=mongodb+srv://sivakumar_123:sivakumar_1234@staysphere.btpyhmh.mongodb.net/staysphere?retryWrites=true^&w=majority^&appName=Staysphere
if "%JWT_SECRET%"=="" set JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
if "%CLIENT_URL%"=="" set CLIENT_URL=http://localhost:5173
start cmd /k "cd staysphere-backend && ..\tools\apache-maven-3.9.6\bin\mvn spring-boot:run"

:: Start Frontend
echo Starting StaySphere Frontend (Vite on port 5173)...
start cmd /k "cd "hotel booking" && npm run dev"

echo.
echo Both backend and frontend servers are launching in new windows!
echo - Backend API will be available at: http://localhost:8080
echo - Frontend will be available at: http://localhost:5173 (or similar)
echo - MongoDB is connected automatically to staysphere.btpyhmh.mongodb.net
echo.
pause
