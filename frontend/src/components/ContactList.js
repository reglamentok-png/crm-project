import React, { useState } from 'react';
import './ContactList.css';

function ContactList({ contacts, onDeleteContact, onRefresh }) {
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот контакт?')) {
      return;
    }

    setDeletingId(id);
    setMessage({ text: '', type: '' });

    try {
      const result = await onDeleteContact(id);
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        // Скрыть сообщение через 3 секунды
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } else {
        setMessage({ text: result.message, type: 'danger' });
      }
    } catch (error) {
      setMessage({ text: 'Произошла ошибка при удалении контакта', type: 'danger' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (contact) => {
    alert(`Просмотр контакта:\n\nИмя: ${contact.name}\nEmail: ${contact.email}\nТелефон: ${contact.phone}\nID: ${contact.id}\nДобавлен: ${formatDate(contact.created_at)}`);
  };

  const handleEdit = (contact) => {
    const newName = prompt('Введите новое имя:', contact.name);
    if (newName === null) return; // пользователь нажал отмена
    
    const newEmail = prompt('Введите новый email:', contact.email);
    if (newEmail === null) return;
    
    const newPhone = prompt('Введите новый телефон:', contact.phone);
    if (newPhone === null) return;
    
    if (newName && newEmail && newPhone) {
      alert(`Редактирование контакта ID: ${contact.id}\n\nНовые данные:\nИмя: ${newName}\nEmail: ${newEmail}\nТелефон: ${newPhone}\n\nПримечание: Для полной реализации требуется интеграция с API PUT /api/contacts/${contact.id}`);
    }
  };

  const formatPhone = (phone) => {
    // Простое форматирование телефона
    return phone;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    
    try {
      // Пробуем разные форматы дат
      let date;
      
      // Если дата в формате SQLite (YYYY-MM-DD HH:MM:SS)
      if (typeof dateString === 'string' && dateString.includes(' ')) {
        // Заменяем пробел на 'T' для корректного парсинга и добавляем 'Z' для указания UTC
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      } else {
        date = new Date(dateString);
      }
      
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) {
        return 'Неверный формат даты';
      }
      
      // Преобразуем UTC время в локальное время пользователя
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error, dateString);
      return 'Ошибка формата';
    }
  };

  return (
    <div className="contact-list card shadow">
      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h3 className="card-title mb-0">
          <i className="bi bi-people-fill me-2"></i>
          Список контактов ({contacts.length})
        </h3>
        <div>
          <button 
            className="btn btn-sm btn-light"
            onClick={onRefresh}
            title="Обновить список"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
      
      <div className="card-body">
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
            {message.text}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage({ text: '', type: '' })}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {contacts.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-person-x display-1 text-muted"></i>
            <h4 className="mt-3">Контакты не найдены</h4>
            <p className="text-muted">Добавьте первый контакт с помощью формы слева</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Имя</th>
                  <th scope="col">Email</th>
                  <th scope="col">Телефон</th>
                  <th scope="col">Добавлен</th>
                  <th scope="col">Действия</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={contact.id} className={deletingId === contact.id ? 'table-warning' : ''}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle bg-primary text-white me-2">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{contact.name}</strong>
                          <div className="small text-muted">ID: {contact.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${contact.email}`} className="text-decoration-none">
                        <i className="bi bi-envelope me-1"></i>
                        {contact.email}
                      </a>
                    </td>
                    <td>
                      <a href={`tel:${contact.phone}`} className="text-decoration-none">
                        <i className="bi bi-telephone me-1"></i>
                        {formatPhone(contact.phone)}
                      </a>
                    </td>
                    <td className="small text-muted">
                      {formatDate(contact.created_at)}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          title="Просмотреть"
                          disabled={deletingId === contact.id}
                          onClick={() => handleView(contact)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-warning"
                          title="Редактировать"
                          disabled={deletingId === contact.id}
                          onClick={() => handleEdit(contact)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(contact.id)}
                          disabled={deletingId === contact.id}
                          title="Удалить"
                        >
                          {deletingId === contact.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-3">
          <div className="row">
            <div className="col">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Всего контактов: <strong>{contacts.length}</strong>
              </small>
            </div>
            <div className="col-auto">
              <small className="text-muted">
                <i className="bi bi-clock-history me-1"></i>
                Обновлено: {new Date().toLocaleTimeString('ru-RU')}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactList;