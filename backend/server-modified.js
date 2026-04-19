const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Определяем, какую базу данных использовать
const USE_POSTGRESQL = process.env.USE_POSTGRESQL === 'true' || false;
let db;

if (USE_POSTGRESQL) {
  // Используем PostgreSQL
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  console.log('Используется PostgreSQL');
  db = {
    query: (text, params) => pool.query(text, params),
    close: () => pool.end()
  };
  
  // Проверка подключения к PostgreSQL
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Ошибка подключения к базе данных PostgreSQL:', err.message);
      console.error('Проверьте переменную окружения DATABASE_URL');
      console.error('Переключаюсь на SQLite...');
      setupSQLite();
    } else {
      console.log('Успешно подключено к базе данных PostgreSQL');
      release();
      createTable();
    }
  });
} else {
  // Используем SQLite
  setupSQLite();
}

function setupSQLite() {
  const sqlite3 = require('sqlite3').verbose();
  const sqliteDb = new sqlite3.Database(path.join(__dirname, 'contacts.db'), (err) => {
    if (err) {
      console.error('Ошибка подключения к SQLite базе данных:', err.message);
      process.exit(1);
    } else {
      console.log('Успешно подключено к SQLite базе данных');
      createTable();
    }
  });
  
  console.log('Используется SQLite');
  db = {
    query: (text, params) => {
      return new Promise((resolve, reject) => {
        if (text.trim().toUpperCase().startsWith('SELECT')) {
          sqliteDb.all(text, params || [], (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
          });
        } else {
          sqliteDb.run(text, params || [], function(err) {
            if (err) reject(err);
            else resolve({ rows: this.lastID ? [{ id: this.lastID }] : [], rowCount: this.changes });
          });
        }
      });
    },
    close: (callback) => sqliteDb.close(callback)
  };
}

// Создание таблицы контактов
async function createTable() {
  try {
    let query;
    if (USE_POSTGRESQL && db.query.toString().includes('pool.query')) {
      query = `
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } else {
      query = `
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    }
    
    await db.query(query);
    console.log('Таблица contacts создана или уже существует');
    
    // Проверяем, есть ли данные в таблице
    const result = await db.query('SELECT COUNT(*) as count FROM contacts');
    const count = parseInt(result.rows[0].count);
    
    if (count === 0) {
      await addSampleData();
    }
  } catch (err) {
    console.error('Ошибка создания таблицы:', err.message);
  }
}

// Добавление тестовых данных
async function addSampleData() {
  try {
    const sampleContacts = [
      { name: 'Иван Иванов', email: 'ivan@example.com', phone: '+7 (123) 456-78-90' },
      { name: 'Мария Петрова', email: 'maria@example.com', phone: '+7 (987) 654-32-10' },
      { name: 'Алексей Сидоров', email: 'alex@example.com', phone: '+7 (555) 123-45-67' }
    ];
    
    for (const contact of sampleContacts) {
      await db.query(
        'INSERT INTO contacts (name, email, phone) VALUES ($1, $2, $3)',
        [contact.name, contact.email, contact.phone]
      );
    }
    
    console.log('Добавлены тестовые контакты');
  } catch (err) {
    console.error('Ошибка добавления тестовых данных:', err.message);
  }
}

// API маршруты

// Получить все контакты
app.get('/api/contacts', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения контактов:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при получении контактов' });
  }
});

// Получить контакт по ID
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query('SELECT * FROM contacts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Контакт не найден' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка получения контакта:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при получении контакта' });
  }
});

// Создать новый контакт
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    if (!name || !email || !phone) {
      res.status(400).json({ error: 'Все поля обязательны для заполнения' });
      return;
    }
    
    const result = await db.query(
      'INSERT INTO contacts (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    
    const newContact = result.rows[0];
    res.status(201).json({
      ...newContact,
      message: 'Контакт успешно создан'
    });
  } catch (err) {
    console.error('Ошибка создания контакта:', err.message);
    
    // Проверяем, является ли ошибка нарушением уникальности (только для PostgreSQL)
    if (err.code === '23505') {
      res.status(400).json({ error: 'Контакт с таким email уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера при создании контакта' });
    }
  }
});

// Обновить контакт
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, phone } = req.body;
    
    if (!name || !email || !phone) {
      res.status(400).json({ error: 'Все поля обязательны для заполнения' });
      return;
    }
    
    const result = await db.query(
      'UPDATE contacts SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, email, phone, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Контакт не найден' });
      return;
    }
    
    res.json({
      ...result.rows[0],
      message: 'Контакт успешно обновлен'
    });
  } catch (err) {
    console.error('Ошибка обновления контакта:', err.message);
    
    // Проверяем, является ли ошибка нарушением уникальности (только для PostgreSQL)
    if (err.code === '23505') {
      res.status(400).json({ error: 'Контакт с таким email уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера при обновлении контакта' });
    }
  }
});

// Удалить контакт
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Контакт не найден' });
      return;
    }
    
    res.json({
      message: 'Контакт успешно удален',
      id: result.rows[0].id
    });
  } catch (err) {
    console.error('Ошибка удаления контакта:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при удалении контакта' });
  }
});

// Проверка здоровья сервера
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected', type: USE_POSTGRESQL ? 'PostgreSQL' : 'SQLite' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: err.message });
  }
});

// Обработка ошибок подключения к базе данных
process.on('unhandledRejection', (err) => {
  console.error('Необработанное отклонение промиса:', err.message);
  console.error('Стек ошибки:', err.stack);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступно по адресу: http://localhost:${PORT}/api/contacts`);
  console.log(`Проверка здоровья: http://localhost:${PORT}/api/health`);
  console.log(`Используется база данных: ${USE_POSTGRESQL ? 'PostgreSQL' : 'SQLite'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Получен сигнал SIGTERM. Закрытие соединений...');
  db.close(() => {
    console.log('Соединения с базой данных закрыты');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Получен сигнал SIGINT. Закрытие соединений...');
  db.close(() => {
    console.log('Соединения с базой данных закрыты');
    process.exit(0);
  });
});