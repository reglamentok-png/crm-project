import React, { useState } from 'react';
import './ThemeSelector.css';

function ThemeSelector({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'light', name: 'Светлая', icon: 'bi-sun', colors: { primary: '#0d6efd', bg: '#f8f9fa' } },
    { id: 'pastel', name: 'Пастельные тона', icon: 'bi-palette', colors: { primary: '#6f42c1', bg: '#f8f9fa' } },
    { id: 'dark', name: 'Темная', icon: 'bi-moon', colors: { primary: '#212529', bg: '#343a40' } }
  ];

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector">
      <button 
        className="btn btn-outline-light btn-sm"
        onClick={() => setIsOpen(!isOpen)}
        title="Оформление"
      >
        <i className="bi bi-palette me-1"></i>
        Оформление
      </button>
      
      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-content">
            {themes.map(theme => (
              <button
                key={theme.id}
                className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <div className="theme-preview" style={{ backgroundColor: theme.colors.primary }}></div>
                <div className="theme-info">
                  <i className={`bi ${theme.icon} me-2`}></i>
                  <span>{theme.name}</span>
                </div>
                {currentTheme === theme.id && (
                  <i className="bi bi-check theme-check"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;