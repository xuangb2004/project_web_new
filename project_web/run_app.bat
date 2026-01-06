@echo off
echo ==========================================
echo      KHOI DONG HE THONG WEB NEWS
echo ==========================================

echo 1. Kiem tra MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL dang chay.
) else (
    echo [WARNING] MySQL chua chay! Vui long bat XAMPP va Start MySQL ngay.
    pause
)

echo.
echo 2. Khoi dong Server (Backend)...
start "Web News - Server (Port 8800)" cmd /k "cd web_news/server && node index.js"

echo.
echo 3. Khoi dong Client (Frontend)...
start "Web News - Client (Port 5173)" cmd /k "cd web_news/client && npm run dev"

echo.
echo ==========================================
echo He thong dang khoi dong...
echo Truy cap trang web tai: http://localhost:5173
echo ==========================================
pause
