import React from 'react';
import './Header.css';

function Header({ onAddContactClick, autoRefresh, onToggleAutoRefresh, lastUpdated }) {
  const formatTime = (date) => {
    if (!date) return 'никогда';
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="header bg-primary text-white py-3">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4">
            <h1 className="h3 mb-0">CRM - Управление контактами</h1>
          </div>
          <div className="col-md-4 text-center">
            <div className="d-flex align-items-center justify-content-center">
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoRefreshSwitch"
                  checked={autoRefresh}
                  onChange={onToggleAutoRefresh}
                />
                <label className="form-check-label ms-2" htmlFor="autoRefreshSwitch">
                  <i className="bi bi-arrow-repeat me-1"></i>
                  Автообновление
                </label>
              </div>
              <small className="ms-3 text-light">
                <i className="bi bi-clock-history me-1"></i>
                Обновлено: {formatTime(lastUpdated)}
              </small>
            </div>
          </div>
          <div className="col-md-4 text-end">
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
