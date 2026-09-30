import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { playPop, playTick } from '../utils/audio';

export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadShared() {
      try {
        setLoading(true);
        const res = await fetch(`/api/share/${id}`);
        if (!res.ok) {
          throw new Error('This shared conversation could not be found or has expired.');
        }
        const data = await res.json();
        setConversation(data);
      } catch (err) {
        setError(err.message || 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    }
    loadShared();
  }, [id]);

  const handleCopyLink = () => {
    playTick();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleContinueChat = () => {
    playPop();
    const token = localStorage.getItem('westy_token');
    if (token) {
      navigate('/chat');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="share-page-root">
      {/* Background Ambience */}
      <div className="share-backdrop-glow" />

      {/* Top Navbar */}
      <header className="share-nav-bar glass">
        <div className="share-nav-left">
          <Link to="/" className="share-logo-link">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="pulse-star">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#share-sparkle)"/>
              <defs>
                <linearGradient id="share-sparkle" x1="2" y1="2" x2="22" y2="22">
                  <stop stopColor="#00f5d4"/>
                  <stop offset="1" stopColor="#7b2cbf"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="share-logo-title gradient-text">Westy AI</span>
            <span className="share-badge-readonly">Shared View</span>
          </Link>
        </div>

        <div className="share-nav-right">
          <button 
            className={`share-action-btn glass ${copied ? 'copied' : ''}`}
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button 
            className="share-cta-btn btn-primary"
            onClick={handleContinueChat}
          >
            <span>Start Chatting</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="share-main-container">
        {loading && (
          <div className="share-loading-state glass">
            <div className="loading-spinner"></div>
            <p>Loading shared conversation...</p>
          </div>
        )}

        {error && (
          <div className="share-error-card glass">
            <div className="share-error-icon">⚠️</div>
            <h2>Conversation Not Found</h2>
            <p>{error}</p>
            <Link to="/chat" className="btn-primary share-back-home">
              Go to Westy Chat
            </Link>
          </div>
        )}

        {!loading && !error && conversation && (
          <div className="share-content-box">
            {/* Conversation Header */}
            <div className="share-header-card glass">
              <div className="share-header-meta">
                <span className="share-date">
                  📅 {new Date(conversation.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="share-lang-badge">
                  🌐 {conversation.language ? conversation.language.toUpperCase() : 'EN'}
                </span>
              </div>
              <h1 className="share-chat-title">{conversation.title || 'Untitled Conversation'}</h1>
            </div>

            {/* Conversation Messages */}
            <div className="share-messages-feed">
              {(conversation.messages || []).map((msg, i) => {
                const isAi = msg.role === 'ai' || msg.role === 'model';
                let cleanText = msg.text || '';
                cleanText = cleanText.replace(/<<<SUGGESTIONS:[\s\S]*?>>>/gi, '').trim();

                const imageSrc = msg.image 
                  ? (msg.image.dataUrl || (msg.image.data ? `data:${msg.image.mimeType || 'image/png'};base64,${msg.image.data}` : null))
                  : null;

                return (
                  <div key={i} className={`share-message-row ${isAi ? 'ai-row' : 'user-row'}`}>
                    <div className="share-message-author-pill">
                      {isAi ? '🤖 Westy AI' : '👤 User'}
                    </div>

                    <div className={`share-bubble glass ${isAi ? 'ai-bubble' : 'user-bubble'}`}>
                      {imageSrc && (
                        <div className="share-attached-image-wrapper">
                          <img src={imageSrc} alt="Attached in conversation" className="share-attached-image" />
                        </div>
                      )}

                      {isAi ? (
                        <MarkdownRenderer content={cleanText} />
                      ) : (
                        <p className="share-user-text">{cleanText}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Prompt */}
            <div className="share-bottom-cta glass">
              <h3>Enjoyed this insight?</h3>
              <p>Sign in or get started with Westy to ask questions, upload images, and collaborate in 15+ dialects.</p>
              <button className="btn-primary cta-large" onClick={handleContinueChat}>
                Try Westy AI Free
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
