import React from 'react';

export default function ThinkingIndicator() {
  return (
    <div className="chatgpt-turn turn-ai">
      <div className="turn-inner">
        <div className="ai-response-container">
          <div className="ai-author-header">
            <div className="ai-avatar-small thinking-avatar-pulse">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#thinking-star)"/>
                <defs>
                  <linearGradient id="thinking-star" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--accent)"/>
                    <stop offset="1" stopColor="var(--accent-purple)"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="ai-author-name">Westy</span>
            <span className="thinking-status-text">Thinking...</span>
          </div>
          <div className="chatgpt-thinking-shimmer">
            <span className="thinking-pulse-dot d1"></span>
            <span className="thinking-pulse-dot d2"></span>
            <span className="thinking-pulse-dot d3"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
