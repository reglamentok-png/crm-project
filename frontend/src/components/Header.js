import React from 'react';
import './Header.css';

function Header({ onAddContactClick }) {
  return (
    <header className="header bg-primary text-white py-3">
      <div className="container">
        <div className="row align-items-center">
          <div className="col">
            <h1 className="h3 mb-0">CRM - Управление контактами</h1>
          </div>
          <div className="col-auto">
            <button 
              className="btn btn-light btn-sm"
              onClick={onAddContactClick}
            >
              <i className="bi bi-person-plus me-1"></i>
              Добавить контакт
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
