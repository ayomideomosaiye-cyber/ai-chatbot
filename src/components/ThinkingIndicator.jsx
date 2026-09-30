import React from 'react';

export default function ThinkingIndicator() {
  return (
    <div className="thinking-indicator">
      <div className="thinking-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#thinking-sparkle)"/>
          <defs>
            <linearGradient id="thinking-sparkle" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--accent)"/>
              <stop offset="1" stopColor="var(--accent-purple)"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="thinking-content">
        <div className="thinking-dots">
          <span className="thinking-dot"></span>
          <span className="thinking-dot"></span>
          <span className="thinking-dot"></span>
        </div>
        <span className="thinking-label">Westy is thinking...</span>
      </div>
    </div>
  );
}
