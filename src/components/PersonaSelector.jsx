import React, { useState, useRef, useEffect } from 'react';
import { personas } from '../utils/personas';
import { playTick } from '../utils/audio';

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
        title="Switch AI Persona & Tone"
      >
        <span className="persona-emoji">{activePersona.emoji}</span>
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
            <span>Select AI Vibe & Persona</span>
            <span className="persona-count">{personas.length} modes</span>
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
                    <span className="persona-option-emoji">{p.emoji}</span>
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
