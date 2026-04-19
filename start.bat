@echo off
echo ========================================
echo Запуск CRM системы управления контактами
echo ========================================
echo.

echo Выбор базы данных:
echo 1. PostgreSQL (требует установки PostgreSQL)
echo 2. SQLite (используется по умолчанию, не требует установки)
set /p db_choice="Выберите вариант (1 или 2, по умолчанию 2): "

if "%db_choice%"=="1" (
    echo Используется PostgreSQL
    set USE_POSTGRESQL=true
) else (
    echo Используется SQLite
    set USE_POSTGRESQL=false
)

echo.
echo 1. Запуск бэкенда (Node.js + Express)...
start cmd /k "cd /d %~dp0backend && set USE_POSTGRESQL=%USE_POSTGRESQL% && node server-modified.js"
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
echo Используемая база данных: 
if "%db_choice%"=="1" (
    echo   PostgreSQL (требует настройки DATABASE_URL в backend/.env)
) else (
    echo   SQLite (файл backend/contacts.db)
)
echo.
echo API Endpoints:
echo   GET    http://localhost:5001/api/contacts
echo   POST   http://localhost:5001/api/contacts
echo   DELETE http://localhost:5001/api/contacts/:id
echo.
echo Проверка здоровья: http://localhost:5001/api/health
echo ========================================
echo.
echo Примечание: Если PostgreSQL не установлен, сервер автоматически
echo переключится на SQLite при запуске.
echo.
pause
