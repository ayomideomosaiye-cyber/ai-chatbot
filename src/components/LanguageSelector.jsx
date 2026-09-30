import React, { useState, useEffect, useRef } from 'react';
import { languages } from '../utils/languages';

export default function LanguageSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find the selected language object
  const currentLang = languages?.find(l => l.code === value) || { code: 'en', name: 'English', flag: '🇺🇸' };

  return (
    <div className="lang-selector" ref={dropdownRef}>
      <button className="lang-current glass" onClick={() => setIsOpen(!isOpen)}>
        <span>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {isOpen && (
        <div className="lang-dropdown glass">
          {(languages || []).map(lang => (
            <button 
              key={lang.code}
              className={`lang-option ${lang.code === value ? 'active' : ''}`}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
