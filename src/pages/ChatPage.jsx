import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiDelete, streamChat } from '../utils/api';
import Sidebar from '../components/Sidebar';
import WelcomeScreen from '../components/WelcomeScreen';
import MessageBubble from '../components/MessageBubble';
import ThinkingIndicator from '../components/ThinkingIndicator';
import ChatInput from '../components/ChatInput';
import LanguageSelector from '../components/LanguageSelector';
import PersonaSelector from '../components/PersonaSelector';
import { playPop, playChime, playTick, isSoundEnabled, toggleSound, stopSpeakingTTS } from '../utils/audio';
import { toggleMotionCursor, isMotionCursorEnabled } from '../components/MotionCursor';
import ShortcutsModal from '../components/ShortcutsModal';
import WestyBrandMark from '../components/WestyBrandMark';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('westy_language') || 'en');
  const [persona, setPersona] = useState(localStorage.getItem('westy_persona') || 'balanced');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [cursorOn, setCursorOn] = useState(() => isMotionCursorEnabled());
  const [lastResponseTime, setLastResponseTime] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [ttsActive, setTtsActive] = useState(false);


  useEffect(() => {
    const handleTtsState = (e) => {
      setTtsActive(!!e.detail?.speaking);
    };
    window.addEventListener('westy-tts-change', handleTtsState);
    return () => {
      window.removeEventListener('westy-tts-change', handleTtsState);
      stopSpeakingTTS();
    };
  }, []);

  
  const messagesEndRef = useRef(null);
  const isStreamingRef = useRef(false);

  const fetchConversations = async () => {
    try {
      const data = await apiGet('/conversations');
      setConversations(data || []);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const lastActive = localStorage.getItem('westy_active_conv');
    if (lastActive) {
      setActiveConversationId(lastActive);
    }
    const initialPrompt = localStorage.getItem('westy_initial_prompt');
    if (initialPrompt) {
      setInput(initialPrompt);
      localStorage.removeItem('westy_initial_prompt');
    }

    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (isStreamingRef.current) return;
      stopSpeakingTTS();
      if (activeConversationId) {
        try {
          const conv = await apiGet(`/conversations/${activeConversationId}`);
          setActiveConversation(conv);
          const normalized = (conv.messages || []).map(m => ({
            ...m,
            role: m.role === 'model' ? 'ai' : m.role
          }));
          setMessages(normalized);
          localStorage.setItem('westy_active_conv', activeConversationId);
        } catch (err) {
          console.error('Failed to fetch conversation', err);
        }
      } else {
        setActiveConversation(null);
        setMessages([]);
        localStorage.removeItem('westy_active_conv');
      }
    };
    fetchMessages();
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + N: New Chat
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        newChat();
      }
      // Ctrl + M: Toggle Voice Input
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        const voiceBtn = document.querySelector('.chat-voice-btn');
        if (voiceBtn) voiceBtn.click();
      }
      // Ctrl + /: Toggle Keyboard Shortcuts Modal
      else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
      // Ctrl + K: Focus chat input
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const inputArea = document.querySelector('.chat-input');
        if (inputArea) inputArea.focus();
      }
      // Esc: Close shortcuts modal
      else if (e.key === 'Escape') {
        setShowShortcutsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLanguageChange = (code) => {
    playTick();
    setLanguage(code);
    localStorage.setItem('westy_language', code);
  };

  const handlePersonaChange = (newPersonaId) => {
    playTick();
    setPersona(newPersonaId);
    localStorage.setItem('westy_persona', newPersonaId);
    const pName = newPersonaId.replace(/_/g, ' ');
    setToastMessage(`Persona set to ${pName}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = () => {
    if (!activeConversationId) {
      setToastMessage("💡 Send a message first to create a conversation link!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    playTick();
    const shareUrl = `${window.location.origin}/share/${activeConversationId}`;
    navigator.clipboard.writeText(shareUrl);
    setToastMessage("✨ Shareable link copied to clipboard!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const newChat = () => {
    playTick();
    stopSpeakingTTS();
    setActiveConversationId(null);
    setMessages([]);
    localStorage.removeItem('westy_active_conv');
  };

  const deleteConversation = async (id) => {
    try {
      playTick();
      stopSpeakingTTS();
      await apiDelete(`/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        newChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const langSpeechMap = {
    en: 'en-US',
    yo: 'yo-NG',
    ig: 'ig-NG',
    ha: 'ha-NG',
    pcm: 'en-NG',
    zh: 'zh-CN',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-SA',
    hi: 'hi-IN',
    pt: 'pt-BR',
    ja: 'ja-JP',
    ko: 'ko-KR',
    de: 'de-DE',
    sw: 'sw-KE',
    zu: 'zu-ZA'
  };

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setToastMessage('Voice input paused');
      setTimeout(() => setToastMessage(null), 1800);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition. Please try Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = langSpeechMap[language] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        playTick();
        setToastMessage('🎙️ Listening... Speak into your microphone');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (event.results[0].isFinal || transcript) {
          setInput(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setToastMessage('⚠️ Microphone access was denied. Please allow microphone permission in your browser.');
        } else if (event.error === 'no-speech') {
          setToastMessage('No speech detected. Tap the mic button to try again.');
        }
        setTimeout(() => setToastMessage(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          setToastMessage(prev => prev?.includes('Listening') ? null : prev);
        }, 1200);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  const handleSoundToggle = () => {
    stopSpeakingTTS();
    const updated = toggleSound();
    setSoundOn(updated);
  };

  const handleCursorToggle = () => {
    playTick();
    const updated = toggleMotionCursor();
    setCursorOn(updated);
    setToastMessage(`✨ Motion Cursor ${updated ? 'Enabled' : 'Disabled'}`);
    setTimeout(() => setToastMessage(null), 2000);
  };



  const exportChat = () => {
    if (messages.length === 0) return;
    playTick();
    const title = activeConversation?.title || 'Westy_Chat_Export';
    let md = `# ${title}\n*Exported from Westy AI on ${new Date().toLocaleString()}*\n\n---\n\n`;
    messages.forEach((m) => {
      const speaker = m.role === 'user' ? '👤 User' : '🤖 Westy AI';
      md += `### ${speaker} (${new Date(m.timestamp || Date.now()).toLocaleTimeString()}):\n\n${m.text}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (overridePayload = null) => {
    let textToSend = input;
    let imageToSend = null;

    if (typeof overridePayload === 'string') {
      textToSend = overridePayload;
    } else if (overridePayload && typeof overridePayload === 'object') {
      textToSend = overridePayload.text !== undefined ? overridePayload.text : input;
      imageToSend = overridePayload.image || null;
    }

    if (!textToSend.trim() && !imageToSend) return;

    stopSpeakingTTS();
    playPop();
    const startTime = Date.now();
    const userMsg = { 
      role: 'user', 
      text: textToSend, 
      image: imageToSend,
      timestamp: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setInput('');
    isStreamingRef.current = true;

    try {
      const response = await streamChat({ 
        message: textToSend, 
        conversationId: activeConversationId, 
        language,
        persona,
        image: imageToSend ? { data: imageToSend.data, mimeType: imageToSend.mimeType } : null
      });
      
      const newConvId = response.headers.get('X-Conversation-Id');
      if (!activeConversationId && newConvId) {
        setActiveConversationId(newConvId);
        localStorage.setItem('westy_active_conv', newConvId);
        fetchConversations();
      }

      if (!response.body) throw new Error('No readable stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let firstChunk = true;
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]' || !dataStr) continue;
          try {
            const parsed = JSON.parse(dataStr);
            const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            accumulatedText += textChunk;

            if (firstChunk) {
              setIsTyping(false);
              setMessages(prev => [...prev, { role: 'ai', text: accumulatedText, timestamp: new Date().toISOString() }]);
              firstChunk = false;
            } else {
              setMessages(prev => {
                const newMsgs = [...prev];
                const lastIdx = newMsgs.length - 1;
                if (newMsgs[lastIdx].role === 'ai') {
                  newMsgs[lastIdx] = { ...newMsgs[lastIdx], text: accumulatedText };
                }
                return newMsgs;
              });
            }
          } catch (e) {
            console.error('Error parsing SSE stream', e);
          }
        }
      }
      playChime();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setLastResponseTime(elapsed);
    } catch (err) {
      console.error('Error sending message', err);
      setIsTyping(false);
    } finally {
      isStreamingRef.current = false;
      setIsTyping(false);
      fetchConversations();
    }
  };

  return (
    <div className="chat-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="chat-toast-floating glass">
          <span>{toastMessage}</span>
        </div>
      )}

      <Sidebar 
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => {
          setActiveConversationId(id);
          if (window.innerWidth <= 768) setSidebarOpen(false);
        }}
        onNewChat={() => {
          newChat();
          if (window.innerWidth <= 768) setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
        user={user}
        onLogout={logout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <div className="chat-main">
        {/* Header with tools */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className="chat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WestyBrandMark size={24} />
              <span className="gradient-text">Westy</span>
            </h2>
          </div>

          <div className="chat-header-actions">
            {/* Quick New Chat Button */}
            <button 
              className="chat-header-btn new-chat-header-btn" 
              onClick={newChat} 
              title="Start a new chat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className="hide-on-mobile">New</span>
            </button>

            {/* Persona Switcher Dropdown */}
            <PersonaSelector currentPersonaId={persona} onChange={handlePersonaChange} />

            {/* Share Chat Button */}
            {activeConversationId && (
              <button className="chat-header-btn share-btn" onClick={handleShare} title="Share conversation link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span className="hide-on-mobile">Share</span>
              </button>
            )}

            {/* Quick Export Button */}
            {messages.length > 0 && (
              <button className="chat-header-btn export-btn" onClick={exportChat} title="Export chat as Markdown">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span className="hide-on-mobile">Export</span>
              </button>
            )}

            {/* Audio Feedback Toggle */}
            <button 
              className={`chat-header-btn ${soundOn ? 'active' : ''}`} 
              onClick={handleSoundToggle}
              title={soundOn ? 'Sound effects enabled' : 'Sound effects muted'}
            >
              {soundOn ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              )}
            </button>

            {/* Motion Cursor Toggle Button (desktop only) */}
            <button 
              className={`chat-header-btn hide-on-mobile ${cursorOn ? 'active' : ''}`}
              onClick={handleCursorToggle}
              title={cursorOn ? 'Motion Cursor: ON (Click to disable)' : 'Motion Cursor: OFF (Click to enable)'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill={cursorOn ? "var(--accent)" : "none"} />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
              </svg>
            </button>

            {/* Live TTS Stop Button in Header */}
            {ttsActive && (
              <button 
                className="chat-header-btn stop-tts-header-btn pulse-glow" 
                onClick={stopSpeakingTTS}
                title="Stop reading aloud"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                </svg>
                <span className="hide-on-mobile">Stop Voice</span>
                <span className="show-on-mobile">Stop</span>
              </button>
            )}

            {/* Keyboard Shortcuts Trigger Button */}
            <button 
              className="chat-header-btn hide-on-mobile" 
              onClick={() => { playTick(); setShowShortcutsModal(true); }} 
              title="Keyboard Shortcuts (Ctrl + /)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
              </svg>
              <span>Shortcuts</span>
            </button>

            {/* Language Dropdown */}
            <LanguageSelector value={language} onChange={handleLanguageChange} />
          </div>
        </div>

        {/* Messages Feed */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <WelcomeScreen onPromptClick={(text) => {
              setInput(text);
              sendMessage({ text });
            }} />
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble 
                key={idx} 
                message={msg} 
                isLast={idx === messages.length - 1} 
                onRegenerate={() => {
                  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                  if (lastUserMsg) sendMessage({ text: lastUserMsg.text, image: lastUserMsg.image });
                }} 
                onSuggestionClick={(suggestionText) => {
                  sendMessage({ text: suggestionText });
                }}
              />
            ))
          )}
          {isTyping && <ThinkingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Voice Stop Bar when speaking */}
        {ttsActive && (
          <div className="floating-tts-bar glass">
            <div className="tts-pulse-bars">
              <span className="tts-bar b1"></span>
              <span className="tts-bar b2"></span>
              <span className="tts-bar b3"></span>
              <span className="tts-bar b4"></span>
            </div>
            <span className="tts-banner-text">Westy is reading aloud...</span>
            <button className="tts-stop-pill" onClick={stopSpeakingTTS} title="Stop voice now">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="3" />
              </svg>
              <span>Stop Voice</span>
            </button>
          </div>
        )}

        {/* Input Bar with Multimodal Attachment */}
        <ChatInput 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSend={(payload) => sendMessage(payload)}
          onVoiceInput={handleVoiceInput}
          isListening={isListening}
          language={language}
        />
      </div>

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </div>
  );
}
