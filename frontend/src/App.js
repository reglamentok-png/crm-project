import React, { useState, useEffect } from 'react';
import './App.css';
import ContactList from './components/ContactList';
import ContactForm from './components/ContactForm';
import Header from './components/Header';

function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Определяем URL API из переменной окружения или используем localhost по умолчанию
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Загрузка контактов при монтировании компонента
  useEffect(() => {
    fetchContacts();
  }, []);

  // Автоматическое обновление контактов каждые 10 секунд
  useEffect(() => {
    let intervalId;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchContacts();
      }, 10000); // 10 секунд
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  // Применение темы при изменении
  useEffect(() => {
    // Удаляем предыдущие классы тем
    document.body.classList.remove('light-theme', 'pastel-theme', 'dark-theme');
    // Добавляем текущую тему
    document.body.classList.add(`${theme}-theme`);
  }, [theme]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Увеличиваем таймаут до 30 секунд для первого запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_URL}/api/contacts`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setContacts(data);
      setLastUpdated(new Date());
    } catch (err) {
      let errorMessage = 'Ошибка загрузки контактов';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Превышено время ожидания ответа от сервера (30 секунд). Сервер может быть запускается.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = `Не удалось подключиться к серверу. Проверьте доступность API по адресу: ${API_URL}`;
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Ошибка загрузки контактов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (newContact) => {
    try {
      const response = await fetch(`${API_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContact),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка добавления контакта');
      }
      
      const addedContact = await response.json();
      setContacts([addedContact, ...contacts]);
      return { success: true, message: 'Контакт успешно добавлен' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/contacts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка удаления контакта');
      }
      
      setContacts(contacts.filter(contact => contact.id !== id));
      return { success: true, message: 'Контакт успешно удален' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const handleAddContactSubmit = async (newContact) => {
    const result = await handleAddContact(newContact);
    if (result.success) {
      setShowAddForm(false);
    }
    return result;
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  return (
    <div className="App">
      <Header 
        onAddContactClick={() => setShowAddForm(true)}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={toggleAutoRefresh}
        lastUpdated={lastUpdated}
      />
      
      {/* Модальное окно для добавления контакта */}
      {showAddForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>
                  Добавить новый контакт
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddForm(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-0">
                <ContactForm 
                  onAddContact={handleAddContactSubmit}
                  onCancel={() => setShowAddForm(false)}
                  hideTitle={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container-fluid px-3 pt-2">
        <div className="row">
          <div className="col-12">
            {loading ? (
              <div className={`loading-container ${theme === 'dark' ? 'dark' : ''}`}>
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="loading-text">Загрузка контактов...</p>
                <div className="progress mt-3" style={{ maxWidth: '300px', margin: '0 auto' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: '100%' }}
                    aria-valuenow="100" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <p className="text-muted mt-2 small">
                  Это может занять несколько секунд, если сервер запускается...
                </p>
              </div>
            ) : error ? (
              <div className={`error-container ${theme === 'dark' ? 'dark' : ''}`}>
                <h5 className="error-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Ошибка загрузки
                </h5>
                <p className="error-message">{error}</p>
                <div className="error-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={fetchContacts}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Повторить попытку
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      // Показать дополнительные инструкции
                      alert(`Проверьте:\n1. Запущен ли бэкенд\n2. Правильно ли настроена база данных PostgreSQL\n3. Доступен ли сервер по адресу: ${API_URL}\n\nТекущий API URL: ${API_URL}`);
                    }}
                  >
                    <i className="bi bi-question-circle me-2"></i>
                    Что делать?
                  </button>
                </div>
              </div>
            ) : (
              <ContactList 
                contacts={contacts} 
                onDeleteContact={handleDeleteContact}
                onRefresh={fetchContacts}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;