import React, { useState, useEffect } from 'react';

function renderRollerIcon(type) {
  switch (type) {
    case 'code':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      );
    case 'reasoning':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      );
    case 'multilingual':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      );
    case 'vision':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      );
    case 'design':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      );
    case 'synthesis':
    default:
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/>
        </svg>
      );
  }
}

export default function VerticalWordRoller({ 
  items = [
    { text: 'Autonomous Reasoning', iconType: 'reasoning' },
    { text: 'Code & Architecture', iconType: 'code' },
    { text: 'Multilingual Processing', iconType: 'multilingual' },
    { text: 'Multimodal Vision', iconType: 'vision' },
    { text: 'System Architecture', iconType: 'design' },
    { text: 'Knowledge Synthesis', iconType: 'synthesis' }
  ],
  interval = 2800,
  className = ''
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animState, setAnimState] = useState('entering');
  const [prevIndex, setPrevIndex] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(currentIndex);
      setAnimState('exiting');

      const nextIdx = (currentIndex + 1) % items.length;

      setTimeout(() => {
        setCurrentIndex(nextIdx);
        setAnimState('entering');
        
        setTimeout(() => {
          setAnimState('active');
        }, 50);
      }, 350);

    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, items.length, interval]);

  const currentItem = items[currentIndex];
  const exitingItem = prevIndex !== null ? items[prevIndex] : null;

  return (
    <span className={`pxxl-roller-stage ${className}`}>
      {/* Invisible spacer giving the stage the dynamic natural width of the active phrase */}
      <span className="pxxl-roller-spacer" aria-hidden="true">
        <span className="pxxl-roller-icon">{renderRollerIcon(currentItem.iconType)}</span>
        <span className="pxxl-roller-text">{currentItem.text}</span>
      </span>

      {/* Exiting item dropping down */}
      {animState === 'exiting' && exitingItem && (
        <span className="pxxl-roller-item drop-down-exit" key={`exit-${prevIndex}`}>
          <span className="pxxl-roller-icon">{renderRollerIcon(exitingItem.iconType)}</span>
          <span className="pxxl-roller-text gradient-text">{exitingItem.text}</span>
        </span>
      )}

      {/* Active or entering item dropping in from above */}
      {animState !== 'exiting' && (
        <span 
          className={`pxxl-roller-item ${animState === 'entering' ? 'drop-down-enter' : 'drop-down-active'}`} 
          key={`active-${currentIndex}`}
        >
          <span className="pxxl-roller-icon">{renderRollerIcon(currentItem.iconType)}</span>
          <span className="pxxl-roller-text gradient-text">{currentItem.text}</span>
        </span>
      )}
    </span>
  );
}
