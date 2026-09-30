import React, { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { playPop, playTick, speakText, stopSpeakingTTS } from '../utils/audio';

export default function MessageBubble({ message, onRegenerate, isLast, onSuggestionClick }) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleTtsChange = (e) => {
      if (!e.detail?.speaking) {
        setIsSpeaking(false);
      }
    };
    window.addEventListener('westy-tts-change', handleTtsChange);
    return () => window.removeEventListener('westy-tts-change', handleTtsChange);
  }, []);

  const isAi = message.role === 'ai' || message.role === 'model';

  // Parse out follow-up suggestions if present in text
  let cleanText = message.text || '';
  let suggestions = [];

  const suggestionRegex = /<<<SUGGESTIONS:\s*(\[[\s\S]*?\])\s*>>>/i;
  const match = cleanText.match(suggestionRegex);
  if (match) {
    try {
      suggestions = JSON.parse(match[1]);
      cleanText = cleanText.replace(match[0], '').trim();
    } catch (e) {
      // Clean up tag if malformed
      cleanText = cleanText.replace(/<<<SUGGESTIONS:[\s\S]*?>>>/gi, '').trim();
    }
  }

  const handleCopy = () => {
    playTick();
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleListen = () => {
    playTick();
    if (isSpeaking) {
      stopSpeakingTTS();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speakText(
      cleanText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };


  const toggleReaction = (emoji) => {
    playTick();
    setReaction(prev => prev === emoji ? null : emoji);
  };

  const handleSuggestion = (s) => {
    playPop();
    if (onSuggestionClick) {
      onSuggestionClick(s);
    }
  };

  const formattedTime = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // Image source resolution
  const imageSrc = message.image 
    ? (message.image.dataUrl || (message.image.data ? `data:${message.image.mimeType || 'image/png'};base64,${message.image.data}` : null))
    : null;

  return (
    <div 
      className={`message-wrapper ${isAi ? 'ai-align' : 'user-align'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`message ${isAi ? 'ai' : 'user'}`}>
        {isAi && (
          <div className="message-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#avatar-sparkle)"/>
              <defs>
                <linearGradient id="avatar-sparkle" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="var(--accent)"/>
                  <stop offset="1" stopColor="var(--accent-purple)"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
        
        <div className="message-content">
          {/* Attached Image Preview */}
          {imageSrc && (
            <div className="message-attached-image-box">
              <img 
                src={imageSrc} 
                alt="User upload" 
                className="message-attached-image" 
                onClick={() => setShowImageModal(true)}
                title="Click to view full image"
              />
            </div>
          )}

          {isAi ? (
            <MarkdownRenderer content={cleanText} />
          ) : (
            <p className="user-message-text">{cleanText}</p>
          )}
        </div>

        {/* Action icons */}
        <div className="message-actions" style={{ opacity: (showActions || isSpeaking) ? 1 : 0 }}>
          <button onClick={handleCopy} title="Copy response">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          {isAi && isLast && (
            <button onClick={onRegenerate} title="Regenerate">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Regenerate
            </button>
          )}

          {isAi && (
            <button 
              onClick={handleListen} 
              className={isSpeaking ? 'voice-stop-btn-active' : ''}
              title={isSpeaking ? "Stop Voice" : "Read aloud"}
            >
              {isSpeaking ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="3"/>
                  </svg>
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                  Listen
                </>
              )}
            </button>
          )}
        </div>

        {/* Reactions for AI responses */}
        {isAi && (
          <div className="message-reactions">
            {['👍', '❤️', '😂', '🎯'].map(emoji => (
              <button 
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={`reaction-btn ${reaction === emoji ? 'selected' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="message-time">{formattedTime}</div>
      </div>

      {/* Clickable Follow-up Suggestions (renders below AI message) */}
      {isAi && suggestions.length > 0 && (
        <div className="message-suggestions-wrapper">
          <div className="suggestions-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/>
            </svg>
            <span>Suggested follow-ups</span>
          </div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                className="suggestion-pill-button glass"
                onClick={() => handleSuggestion(suggestion)}
              >
                <span>{suggestion}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="pill-arrow">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Size Image Modal */}
      {showImageModal && imageSrc && (
        <div className="image-lightbox-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-lightbox-content glass" onClick={(e) => e.stopPropagation()}>
            <img src={imageSrc} alt="Full view" className="lightbox-image" />
            <button className="lightbox-close-btn" onClick={() => setShowImageModal(false)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
