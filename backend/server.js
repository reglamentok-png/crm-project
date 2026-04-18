const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных SQLite
const db = new sqlite3.Database('./contacts.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Подключено к базе данных SQLite');
    createTable();
  }
});

// Создание таблицы контактов
function createTable() {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Ошибка создания таблицы:', err.message);
    } else {
      console.log('Таблица contacts создана или уже существует');
      // Добавим тестовые данные, если таблица пустая
      addSampleData();
    }
  });
}

// Добавление тестовых данных
function addSampleData() {
  db.get('SELECT COUNT(*) as count FROM contacts', (err, row) => {
    if (err) {
      console.error('Ошибка проверки данных:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const sampleContacts = [
        { name: 'Иван Иванов', email: 'ivan@example.com', phone: '+7 (123) 456-78-90' },
        { name: 'Мария Петрова', email: 'maria@example.com', phone: '+7 (987) 654-32-10' },
        { name: 'Алексей Сидоров', email: 'alex@example.com', phone: '+7 (555) 123-45-67' }
      ];
      
      const stmt = db.prepare('INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)');
      sampleContacts.forEach(contact => {
        stmt.run(contact.name, contact.email, contact.phone);
      });
      stmt.finalize();
      console.log('Добавлены тестовые контакты');
    }
  });
}

// API маршруты

// Получить все контакты
app.get('/api/contacts', (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Получить контакт по ID
app.get('/api/contacts/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Контакт не найден' });
      return;
    }
    res.json(row);
  });
});

// Создать новый контакт
app.post('/api/contacts', (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    return;
  }
  
  db.run('INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)', 
    [name, email, phone], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      // Получаем полную информацию о созданном контакте
      db.get('SELECT * FROM contacts WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json({ 
          ...row,
          message: 'Контакт успешно создан' 
        });
      });
    }
  );
});

// Обновить контакт
app.put('/api/contacts/:id', (req, res) => {
  const id = req.params.id;
  const { name, email, phone } = req.body;
  
  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    return;
  }
  
  db.run('UPDATE contacts SET name = ?, email = ?, phone = ? WHERE id = ?', 
    [name, email, phone, id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Контакт не найден' });
        return;
      }
      res.json({ 
        id, 
        name, 
        email, 
        phone,
        message: 'Контакт успешно обновлен' 
      });
    }
  );
});

// Удалить контакт
app.delete('/api/contacts/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Контакт не найден' });
      return;
    }
    res.json({ 
      message: 'Контакт успешно удален',
      id: id
    });
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступно по адресу: http://localhost:${PORT}/api/contacts`);
});