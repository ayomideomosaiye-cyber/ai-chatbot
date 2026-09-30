import React from 'react';
import VerticalWordRoller from './VerticalWordRoller';

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
      
      <div className="welcome-roller-tag glass">
        <span className="welcome-roller-prefix">Ready for</span>
        <VerticalWordRoller 
          interval={2600}
          items={[
            { text: 'Code & Architecture', icon: '💻' },
            { text: 'Live Web Knowledge', icon: '🌐' },
            { text: 'Yorùbá, Igbo & Pidgin', icon: '🗣️' },
            { text: 'Vision & Multimodal', icon: '👁️' },
            { text: 'Creative Writing', icon: '📝' },
            { text: 'Complex Reasoning', icon: '⚡' }
          ]} 
        />
      </div>

      <p className="welcome-subtitle">Your AI companion. Ask me anything — from complex software engineering to native African dialects and live web exploration.</p>
      
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
