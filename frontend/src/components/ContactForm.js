import React, { useState } from 'react';
import './ContactForm.css';

function ContactForm({ onAddContact, onCancel, hideTitle }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setMessage({ text: 'Все поля обязательны для заполнения', type: 'danger' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ text: 'Введите корректный email', type: 'danger' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await onAddContact(formData);
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        // Очистка формы
        setFormData({
          name: '',
          email: '',
          phone: ''
        });
        // Скрыть сообщение через 3 секунды
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } else {
        setMessage({ text: result.message, type: 'danger' });
      }
    } catch (error) {
      setMessage({ text: 'Произошла ошибка при добавлении контакта', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form">
      <div className="card-body bg-light p-4">
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
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              <i className="bi bi-person me-1"></i>
              Имя *
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите имя"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="bi bi-envelope me-1"></i>
              Email *
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">
              <i className="bi bi-telephone me-1"></i>
              Телефон *
            </label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (XXX) XXX-XX-XX"
              required
            />
          </div>
          
          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Добавление...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Добавить контакт
                </>
              )}
            </button>
            
            {onCancel && (
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle me-2"></i>
                Отмена
              </button>
            )}
          </div>
        </form>
        
        <div className="mt-3 text-muted small">
          <p className="mb-1"><strong>Примечание:</strong></p>
          <ul className="mb-0">
            <li>Все поля обязательны для заполнения</li>
            <li>Email должен быть в правильном формате</li>
            <li>После добавления контакт появится в списке</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;