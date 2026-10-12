import React, { useState, useRef, useEffect } from 'react';
import { personas } from '../utils/personas';
import { playTick } from '../utils/audio';

function renderPersonaIcon(type) {
  switch (type) {
    case 'code':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      );
    case 'book':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      );
    case 'briefcase':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      );
    case 'sparkle':
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/>
        </svg>
      );
  }
}

export default function PersonaSelector({ currentPersonaId, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const activePersona = personas.find(p => p.id === currentPersonaId) || personas[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    playTick();
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="persona-selector-container" ref={containerRef}>
      <button 
        className={`persona-trigger-btn glass ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Select Assistant Mode"
      >
        <span className="persona-icon-box">{renderPersonaIcon(activePersona.iconType)}</span>
        <span className="persona-name">{activePersona.name}</span>
        <span className="persona-badge-pill">{activePersona.badge}</span>
        <svg 
          className={`chevron-icon ${isOpen ? 'rotated' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="persona-dropdown-menu glass">
          <div className="persona-dropdown-header">
            <span>Assistant Mode</span>
            <span className="persona-count">{personas.length} profiles</span>
          </div>
          <div className="persona-list">
            {personas.map((p) => {
              const isSelected = p.id === currentPersonaId;
              return (
                <button
                  key={p.id}
                  className={`persona-option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(p.id)}
                >
                  <div className="persona-option-top">
                    <span className="persona-option-icon">{renderPersonaIcon(p.iconType)}</span>
                    <span className="persona-option-title">{p.name}</span>
                    <span className="persona-option-badge">{p.badge}</span>
                    {isSelected && (
                      <span className="persona-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="persona-option-desc">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
