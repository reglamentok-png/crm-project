# Настройка PostgreSQL для CRM системы

## 1. Установка PostgreSQL

### Windows:
1. Скачайте установщик с официального сайта: https://www.postgresql.org/download/windows/
2. Запустите установщик и следуйте инструкциям
3. Запомните пароль для пользователя postgres
4. По умолчанию PostgreSQL устанавливается на порту 5432

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Создание базы данных и пользователя

### Подключение к PostgreSQL:
```bash
psql -U postgres
```

### Создание базы данных:
```sql
CREATE DATABASE crm_database;
```

### Создание пользователя (опционально):
```sql
CREATE USER crm_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE crm_database TO crm_user;
```

### Проверка создания:
```sql
\l  -- список баз данных
\du -- список пользователей
```

## 3. Настройка переменных окружения

Отредактируйте файл `backend/.env`:

```env
# Для пользователя postgres (по умолчанию)
DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/crm_database

# Или для созданного пользователя
DATABASE_URL=postgresql://crm_user:secure_password@localhost:5432/crm_database
```

## 4. Проверка подключения

### Установите psql (если еще не установлен):
```bash
# Windows: устанавливается вместе с PostgreSQL
# macOS: brew install postgresql
# Linux: sudo apt install postgresql-client
```

### Проверьте подключение:
```bash
psql -h localhost -p 5432 -U postgres -d crm_database
```

## 5. Запуск приложения

### Вариант 1: Используя start.bat
```bash
cd C:\Users\User\Desktop\crm-project
start.bat
```

### Вариант 2: Вручную
```bash
# Терминал 1: Бэкенд
cd backend
npm start

# Терминал 2: Фронтенд
cd frontend
npm start
```

## 6. Проверка работы API

### Проверка здоровья:
```
GET http://localhost:5001/api/health
```

### Получение контактов:
```
GET http://localhost:5001/api/contacts
```

### Создание контакта:
```
POST http://localhost:5001/api/contacts
Content-Type: application/json

{
  "name": "Тестовый контакт",
  "email": "test@example.com",
  "phone": "+7 (999) 123-45-67"
}
```

## 7. Устранение неполадок

### Ошибка: "Ошибка подключения к базе данных PostgreSQL"
1. Проверьте, запущен ли PostgreSQL:
   ```bash
   # Windows: services.msc → PostgreSQL
   # macOS: brew services list
   # Linux: sudo systemctl status postgresql
   ```

2. Проверьте правильность DATABASE_URL в .env файле

3. Проверьте доступность порта 5432:
   ```bash
   netstat -an | findstr :5432  # Windows
   netstat -tulpn | grep 5432   # Linux/macOS
   ```

### Ошибка: "password authentication failed"
1. Проверьте пароль в DATABASE_URL
2. Проверьте права пользователя:
   ```sql
   ALTER USER postgres WITH PASSWORD 'новый_пароль';
   ```

## 8. Резервное копирование и восстановление

### Экспорт базы данных:
```bash
pg_dump -U postgres crm_database > backup.sql
```

### Импорт базы данных:
```bash
psql -U postgres crm_database < backup.sql
```

## 9. Дополнительные настройки

### Оптимизация для продакшена:
```env
# В файле backend/.env
PG_MAX_CONNECTIONS=20
PG_IDLE_TIMEOUT=30000
PG_CONNECTION_TIMEOUT=2000
NODE_ENV=production
```

### SSL подключение (для облачных баз данных):
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

## 10. Полезные команды PostgreSQL

```sql
-- Просмотр таблиц
\dt

-- Просмотр структуры таблицы
\d contacts

-- Просмотр данных
SELECT * FROM contacts;

-- Очистка таблицы
TRUNCATE TABLE contacts;

-- Удаление таблицы
DROP TABLE contacts;
```

## 11. Миграция с SQLite на PostgreSQL

Приложение автоматически создаст таблицу `contacts` при первом запуске с PostgreSQL. Тестовые данные будут добавлены автоматически, если таблица пустая.

## 12. Мониторинг

### Проверка активных подключений:
```sql
SELECT * FROM pg_stat_activity;
```

### Проверка размера базы данных:
```sql
SELECT pg_size_pretty(pg_database_size('crm_database'));