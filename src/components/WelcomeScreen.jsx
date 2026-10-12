import React from 'react';
import VerticalWordRoller from './VerticalWordRoller';

export default function WelcomeScreen({ onPromptClick }) {
  const prompts = [
    { 
      type: 'code', 
      title: 'Software & Architecture', 
      text: 'Design a high-throughput queue worker in TypeScript with retry backoff' 
    },
    { 
      type: 'reasoning', 
      title: 'System Analysis', 
      text: 'Compare event-driven architecture vs request-response for real-time APIs' 
    },
    { 
      type: 'translate', 
      title: 'Multilingual Fluency', 
      text: 'Translate technical documentation accurately between English, French, and Yoruba' 
    },
    { 
      type: 'write', 
      title: 'Strategic Synthesis', 
      text: 'Draft an executive project proposal with milestone breakdown and risk analysis' 
    }
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
        <span className="welcome-roller-prefix">Engineered for</span>
        <VerticalWordRoller interval={2600} />
      </div>

      <p className="welcome-subtitle">Advanced conversational assistant. Analyze architectures, write resilient code, converse across languages, and reason through complex problems.</p>
      
      <div className="welcome-prompts">
        {prompts.map((p, i) => (
          <div key={i} className="welcome-prompt glass" onClick={() => onPromptClick(p.text)}>
            <div className="prompt-card-icon-box">
              {p.type === 'code' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              )}
              {p.type === 'reasoning' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
              )}
              {p.type === 'translate' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              )}
              {p.type === 'write' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              )}
            </div>
            <div className="prompt-card-title">{p.title}</div>
            <div className="prompt-card-text">{p.text}</div>
          </div>
        ))}
      </div>
      
      <div className="welcome-features">
        <span className="welcome-feature">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          15+ Languages
        </span>
        <span className="welcome-feature">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          Real-Time Streaming
        </span>
        <span className="welcome-feature">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          Formatted Markdown
        </span>
        <span className="welcome-feature">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          </svg>
          Voice Dictation
        </span>
      </div>
    </div>
  );
}
