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

  // Загрузка контактов при монтировании компонента
  useEffect(() => {
    fetchContacts();
  }, []);

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
      const response = await fetch('http://localhost:5001/api/contacts');
      if (!response.ok) {
        throw new Error('Ошибка загрузки контактов');
      }
      const data = await response.json();
      setContacts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (newContact) => {
    try {
      const response = await fetch('http://localhost:5001/api/contacts', {
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
      const response = await fetch(`http://localhost:5001/api/contacts/${id}`, {
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

  return (
    <div className="App">
      <Header 
        onAddContactClick={() => setShowAddForm(true)}
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
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка контактов...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                Ошибка: {error}
                <button 
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={fetchContacts}
                >
                  Повторить
                </button>
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