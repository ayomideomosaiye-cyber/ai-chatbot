import React from 'react';

export default function WelcomeScreen({ onPromptClick }) {
  const prompts = [
    { icon: '💻', title: 'Write Code', text: 'Help me write a Python script to sort a list' },
    { icon: '🌍', title: 'Translate', text: 'Translate "Good morning" to Yoruba and Japanese' },
    { icon: '📝', title: 'Write & Edit', text: 'Help me draft a professional email' },
    { icon: '💡', title: 'Brainstorm', text: 'Give me 5 creative project ideas' }
  ];

  return (
    <div className="welcome">
      <div className="welcome-logo">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#welcome-sparkle)"/>
          <defs>
            <linearGradient id="welcome-sparkle" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--accent)"/>
              <stop offset="1" stopColor="var(--accent-purple)"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 className="welcome-title">Hello! I'm <span className="gradient-text">Westy</span></h1>
      <p className="welcome-subtitle">Your AI assistant. Ask me anything — from coding to creative writing, language translation to learning.</p>
      
      <div className="welcome-prompts">
        {prompts.map((p, i) => (
          <div key={i} className="welcome-prompt glass" onClick={() => onPromptClick(p.text)}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{p.icon}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{p.title}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{p.text}</div>
          </div>
        ))}
      </div>
      
      <div className="welcome-features">
        <span className="welcome-feature">🌍 15+ Languages</span>
        <span className="welcome-feature">⚡ Real-time Streaming</span>
        <span className="welcome-feature">📝 Markdown Support</span>
        <span className="welcome-feature">🎤 Voice Input</span>
      </div>
    </div>
  );
}
