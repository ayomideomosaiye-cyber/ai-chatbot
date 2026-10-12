import React, { useState, useEffect, useRef } from 'react';
import { languages } from '../utils/languages';
import FlagBadge from './FlagBadge';

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

  const currentLang = languages?.find(l => l.code === value) || { code: 'en', name: 'English' };

  return (
    <div className="lang-selector" ref={dropdownRef}>
      <button className="lang-current glass" onClick={() => setIsOpen(!isOpen)} title="Select Language">
        <FlagBadge code={currentLang.code} size={16} />
        <span>{currentLang.name}</span>
        <svg 
          width="14" 
          height="14" 
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
              <FlagBadge code={lang.code} size={16} />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
