import React, { useState, useEffect } from 'react';

/**
 * VerticalWordRoller - Inspired by pxxl.app's smooth vertical downward text/card drop animation.
 * Cycles words/phrases down with 3D perspective, blur fade, and spring-like descent.
 */
export default function VerticalWordRoller({ 
  items = [
    { text: 'Live Web Search', icon: '🌐' },
    { text: 'Code & Logic', icon: '💻' },
    { text: 'African Dialects', icon: '🗣️' },
    { text: 'Multimodal Vision', icon: '👁️' },
    { text: 'Deep Reasoning', icon: '⚡' },
    { text: 'Creative Writing', icon: '📝' }
  ],
  interval = 2800,
  className = ''
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animState, setAnimState] = useState('entering'); // 'entering' | 'active' | 'exiting'
  const [prevIndex, setPrevIndex] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(currentIndex);
      setAnimState('exiting');

      const nextIdx = (currentIndex + 1) % items.length;

      // Small delay for downward exit before entering new one
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
      {/* Exiting item dropping down */}
      {animState === 'exiting' && exitingItem && (
        <span className="pxxl-roller-item drop-down-exit" key={`exit-${prevIndex}`}>
          <span className="pxxl-roller-icon">{exitingItem.icon}</span>
          <span className="pxxl-roller-text gradient-text">{exitingItem.text}</span>
        </span>
      )}

      {/* Active or entering item dropping in from above */}
      {animState !== 'exiting' && (
        <span 
          className={`pxxl-roller-item ${animState === 'entering' ? 'drop-down-enter' : 'drop-down-active'}`} 
          key={`active-${currentIndex}`}
        >
          <span className="pxxl-roller-icon">{currentItem.icon}</span>
          <span className="pxxl-roller-text gradient-text">{currentItem.text}</span>
        </span>
      )}
    </span>
  );
}
