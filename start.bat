@echo off
echo ========================================
echo Запуск CRM системы управления контактами
echo ========================================
echo.

echo 1. Запуск бэкенда (Node.js + Express + SQLite)...
start cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul

echo 2. Запуск фронтенда (React)...
start cmd /k "cd /d %~dp0frontend && npm start"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Приложение успешно запущено!
echo.
echo Бэкенд:  http://localhost:5001
echo Фронтенд: http://localhost:3000
echo.
echo API Endpoints:
echo   GET    http://localhost:5001/api/contacts
echo   POST   http://localhost:5001/api/contacts
echo   DELETE http://localhost:5001/api/contacts/:id
echo ========================================
echo.
pause