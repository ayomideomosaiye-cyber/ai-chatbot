import React, { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { playPop, playTick, speakText, stopSpeakingTTS } from '../utils/audio';

export default function MessageBubble({ message, onRegenerate, isLast, onSuggestionClick }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'good' | 'bad' | null
  const [shared, setShared] = useState(false);
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
      cleanText = cleanText.replace(/<<<SUGGESTIONS:[\s\S]*?>>>/gi, '').trim();
    }
  }

  const handleCopy = () => {
    playTick();
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    playTick();
    setFeedback(prev => prev === type ? null : type);
  };

  const handleShare = () => {
    playTick();
    if (navigator.share) {
      navigator.share({
        title: 'Westy AI Response',
        text: cleanText.substring(0, 200) + '...',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
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

  const handleSuggestion = (s) => {
    playPop();
    if (onSuggestionClick) {
      onSuggestionClick(s);
    }
  };

  const formattedTime = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '';

  // Image source resolution
  const imageSrc = message.image 
    ? (message.image.dataUrl || (message.image.data ? `data:${message.image.mimeType || 'image/png'};base64,${message.image.data}` : null))
    : null;

  return (
    <div className={`chatgpt-turn ${isAi ? 'turn-ai' : 'turn-user'}`}>
      <div className="turn-inner">
        {/* User Message Layout: Sleek pill bubble on the right */}
        {!isAi ? (
          <div className="user-bubble-container">
            {imageSrc && (
              <div className="user-image-preview">
                <img 
                  src={imageSrc} 
                  alt="Uploaded" 
                  onClick={() => setShowImageModal(true)}
                  title="Click to expand image"
                />
              </div>
            )}
            <div className="user-bubble">
              <p className="user-bubble-text">{cleanText}</p>
            </div>
            {formattedTime && <span className="turn-timestamp user-time">{formattedTime}</span>}
          </div>
        ) : (
          /* AI Message Layout: Full-width, unboxed document style like ChatGPT / Claude */
          <div className="ai-response-container">
            {/* Header / Avatar indicator */}
            <div className="ai-author-header">
              <div className="ai-avatar-small">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#westy-star)"/>
                  <defs>
                    <linearGradient id="westy-star" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="var(--accent)"/>
                      <stop offset="1" stopColor="var(--accent-purple)"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="ai-author-name">Westy</span>
              {formattedTime && <span className="turn-timestamp">{formattedTime}</span>}
            </div>

            {/* Attached Image Preview if AI returns one */}
            {imageSrc && (
              <div className="ai-attached-image-box">
                <img 
                  src={imageSrc} 
                  alt="Visual response" 
                  className="ai-attached-image" 
                  onClick={() => setShowImageModal(true)}
                />
              </div>
            )}

            {/* Flowing Full-Width Markdown Content */}
            <div className="ai-markdown-body">
              <MarkdownRenderer content={cleanText} />
            </div>

            {/* ChatGPT-style Minimalist Action Bar */}
            <div className="chatgpt-actions-bar">
              {/* Copy */}
              <button 
                onClick={handleCopy} 
                className={`action-btn-icon ${copied ? 'action-active' : ''}`}
                title={copied ? 'Copied to clipboard' : 'Copy response'}
                aria-label="Copy"
              >
                {copied ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="action-btn-label">Copied</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <span className="action-btn-label">Copy</span>
                  </>
                )}
              </button>

              {/* Good response / Thumbs Up */}
              <button 
                onClick={() => handleFeedback('good')} 
                className={`action-btn-icon ${feedback === 'good' ? 'action-active feedback-good' : ''}`}
                title="Good response"
                aria-label="Good response"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </button>

              {/* Bad response / Thumbs Down */}
              <button 
                onClick={() => handleFeedback('bad')} 
                className={`action-btn-icon ${feedback === 'bad' ? 'action-active feedback-bad' : ''}`}
                title="Bad response"
                aria-label="Bad response"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                </svg>
              </button>

              {/* Read Aloud / Listen */}
              <button 
                onClick={handleListen} 
                className={`action-btn-icon ${isSpeaking ? 'action-active voice-playing' : ''}`}
                title={isSpeaking ? 'Stop voice' : 'Read aloud'}
                aria-label="Read aloud"
              >
                {isSpeaking ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="5" width="14" height="14" rx="2" />
                    </svg>
                    <span className="action-btn-label">Stop</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  </>
                )}
              </button>

              {/* Share */}
              <button 
                onClick={handleShare} 
                className={`action-btn-icon ${shared ? 'action-active' : ''}`}
                title={shared ? 'Link copied!' : 'Share message'}
                aria-label="Share"
              >
                {shared ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="action-btn-label">Link copied</span>
                  </>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                )}
              </button>

              {/* Regenerate (shown on last response) */}
              {isLast && (
                <button 
                  onClick={onRegenerate} 
                  className="action-btn-icon"
                  title="Regenerate response"
                  aria-label="Regenerate"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  <span className="action-btn-label">Regenerate</span>
                </button>
              )}
            </div>

            {/* Clickable Follow-up Suggestions Chips */}
            {suggestions.length > 0 && (
              <div className="chatgpt-suggestions-lane">
                <div className="suggestions-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/>
                  </svg>
                  <span>Suggested follow-ups</span>
                </div>
                <div className="suggestions-chips-row">
                  {suggestions.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      className="chatgpt-chip-btn"
                      onClick={() => handleSuggestion(suggestion)}
                    >
                      <span>{suggestion}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
