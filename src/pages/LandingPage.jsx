import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { languages } from '../utils/languages';
import NeuralCoreCanvas from '../components/NeuralCoreCanvas';
import FlagBadge from '../components/FlagBadge';
import VerticalWordRoller from '../components/VerticalWordRoller';
import { toggleMotionCursor, isMotionCursorEnabled } from '../components/MotionCursor';
import { playPop, playChime, playTick } from '../utils/audio';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState('yoruba');
  const [customInput, setCustomInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [cursorOn, setCursorOn] = useState(() => isMotionCursorEnabled());

  const handleCursorToggle = () => {
    playTick();
    const updated = toggleMotionCursor();
    setCursorOn(updated);
  };


  // Rotating prompt placeholders
  const rotatingPrompts = [
    'Ask in Yoruba: "Báwo ni mo ṣe lè tọ́jú owó mi dáadáa?"',
    'Ask in Igbo: "Kedu ka m ga-esi zụlite azụmahịa m?"',
    'Ask in Hausa: "Yaya zan rubuta tsarin kasuwanci mai kyau?"',
    'Ask in Code: "Write a high-performance Python search algorithm"',
    'Ask in Pidgin: "How I fit learn web development from scratch?"'
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingPrompts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [rotatingPrompts.length]);

  // Mode previews matching the remixed template
  const modeData = {
    yoruba: {
      tag: 'Yoruba · Native Dialect',
      userQuery: 'Báwo ni mo ṣe lè tọ́jú owó mi dáadáa nígbà tí mo bá ń kọ́ iṣẹ́?',
      aiResponse: 'Ẹ kú àbọ̀! Láti tọ́jú owó rẹ nígbà tí o ń kọ́ iṣẹ́, pín owó rẹ sí 50/30/20: ida àádọ́ta fún ohun kò-ṣeé-má-nìí, ọgbọ̀n fún ohun ìgbádùn, ogún fún ìfowópamọ́. Fipamọ́ kí o tó bẹ̀rẹ̀ sí náwó!',
      codeTitle: 'Yoruba Currency Format in JS',
      codeSnippet: `// Format Nigerian Naira with cultural notation\nfunction formatNaira(amount) {\n  return new Intl.NumberFormat('en-NG', {\n    style: 'currency',\n    currency: 'NGN',\n  }).format(amount);\n}`
    },
    igbo: {
      tag: 'Igbo · Native Dialect',
      userQuery: 'Kedu ka m ga-esi zụlite azụmahịa m n’ịntanetị n’afọ a?',
      aiResponse: 'Nnọọ! Iji kwalite azụmahịa gị n’ịntanetị: 1. Nwee ebe nrụọrụ weebụ siri ike. 2. Jiri nkwukọrịta doro anya na foto dị mma. 3. Zaghachi ndị ahịa gị n’oge!',
      codeTitle: 'E-commerce Cart Logic',
      codeSnippet: `// Calculate cart with discounted bulk rates\nconst calculateTotal = (items) => {\n  return items.reduce((acc, curr) => \n    acc + (curr.price * curr.quantity), 0);\n};`
    },
    hausa: {
      tag: 'Hausa · Native Dialect',
      userQuery: 'Yaya zan inganta fasahar rubuta lambobin kwamfuta?',
      aiResponse: 'Barka da zuwa! Don inganta ƙwarewar coding: Karanta littattafai masu inganci, gina ayyuka na zahiri kowace rana, kuma shiga al\'ummomin masu haɓaka software don samun taimako.',
      codeTitle: 'Algorithm Performance Benchmark',
      codeSnippet: `def benchmark(func, data):\n    start = time.perf_counter()\n    res = func(data)\n    return res, time.perf_counter() - start`
    },
    code: {
      tag: 'Full-Stack Code & Architecture',
      userQuery: 'Write a TypeScript debounce function with immediate invocation option.',
      aiResponse: 'Here is a memory-safe, generic debounce utility in TypeScript with immediate execution support and cleanup cancellation.',
      codeTitle: 'debounce.ts',
      codeSnippet: `export function debounce<T extends (...args: any[]) => any>(\n  fn: T,\n  delay: number\n): (...args: Parameters<T>) => void {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}`
    },
    pidgin: {
      tag: 'Nigerian Pidgin · Local Blend',
      userQuery: 'Westy, abeg explain how artificial intelligence dey learn like say I be 10 years old.',
      aiResponse: 'No wahala! Think of AI like small pikin wey dey learn to sabi cat and dog. If you show am 1,000 pictures of dogs and cats, next time e see new animal, e go fit tell you say "O boy, this one na dog!" Na so machine learning dey work!',
      codeTitle: 'Neural Weight Calculation',
      codeSnippet: `const predict = (weights, inputs, bias) => {\n  const sum = inputs.reduce((a, v, i) => \n    a + v * weights[i], bias);\n  return 1 / (1 + Math.exp(-sum)); // Sigmoid\n};`
    }
  };

  const handleLaunchWithPrompt = (promptText) => {
    playPop();
    localStorage.setItem('westy_initial_prompt', promptText);
    navigate(user ? '/chat' : '/login');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    playPop();
    localStorage.setItem('westy_initial_prompt', customInput);
    navigate(user ? '/chat' : '/login');
  };

  const copyCode = (text) => {
    playTick();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="landing-page remixed-theme">
      {/* 
        ============================================================
        HERO SECTION: BUILT DIRECTLY WITH THE REMIXED MOODY PORTAL
        ============================================================ 
      */}
      <div className="portal-hero-container">
        {/* The Exact Remixed Portal Artwork Backdrop */}
        <div className="portal-backdrop-img">
          <img src="/portal-backdrop.jpg" alt="Westy AI Portal" className="portal-bg-asset" />
          <div className="portal-gradient-overlay"></div>
        </div>

        {/* Floating Top Nav */}
        <header className="landing-nav glass-strong portal-nav">
          <div className="landing-logo">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" className="pulse-star">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#hero-star-grad)" />
              <defs>
                <linearGradient id="hero-star-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="var(--accent)" />
                  <stop offset="1" stopColor="var(--accent-purple)" />
                </linearGradient>
              </defs>
            </svg>
            <span className="landing-brand gradient-text">Westy</span>
          </div>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#demo">Live Workspace</a>
            <a href="#languages">Languages</a>
          </nav>

          <div className="landing-nav-actions">
            {/* Custom Interactive Motion Cursor Switch */}
            <button 
              className={`cursor-toggle-pill glass ${cursorOn ? 'active' : ''}`} 
              onClick={handleCursorToggle}
              title={cursorOn ? 'Interactive Motion Cursor: ON (Click to toggle)' : 'Interactive Motion Cursor: OFF (Click to toggle)'}
            >
              <span className="cursor-dot-icon">✦</span>
              <span className="cursor-toggle-text">Cursor {cursorOn ? 'ON' : 'OFF'}</span>
            </button>

            {user ? (
              <>
                {user.isAdmin && (
                  <Link to="/admin" className="btn btn-sm btn-ghost nav-admin-btn" onClick={() => playTick()}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Admin
                  </Link>
                )}
                <Link to="/chat" className="btn btn-sm btn-primary nav-chat-btn" onClick={() => playPop()}>
                  Open Chat →
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-ghost" onClick={() => playTick()}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-sm btn-primary" onClick={() => playPop()}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Hero Copy (From the Remixed Template) */}
        <div className="portal-hero-content">
          <div className="hero-pill-badge glow-badge">
            <span className="hero-pill-dot animate-ping"></span>
            <span>Multilingual AI Companion · Real-Time Intelligence</span>
          </div>

          <h1 className="hero-title portal-title">
            <span className="hero-main-line">Next-Gen AI</span>
            <div className="hero-roller-capsule">
              <VerticalWordRoller />
            </div>
          </h1>

          <p className="hero-subtitle portal-subtitle">
            An intelligent AI companion that speaks your language — <strong>Yoruba</strong>, <strong>Igbo</strong>, <strong>Hausa</strong>, <strong>Pidgin</strong>, English, and Code. Real-time reasoning, custom prompts, and pure clarity.
          </p>

          <div className="hero-cta-group">
            <button 
              onClick={() => { playPop(); navigate(user ? '/chat' : '/signup'); }} 
              className="btn hero-btn-main portal-main-cta glow-hover"
            >
              <span>Begin Conversation</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <a href="#demo" className="btn btn-secondary hero-btn-sub" onClick={() => playTick()}>
              Explore Workspace ↓
            </a>
          </div>

          {/* Floating Remixed Prompt Input Bar */}
          <form onSubmit={handleCustomSubmit} className="hero-prompt-bar glass-strong prompt-bar-animated portal-prompt-bar">
            <div className="prompt-input-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="prompt-star-icon">
                <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="url(#hero-star-grad)" />
              </svg>
              <input 
                type="text"
                className="prompt-input-field"
                placeholder={rotatingPrompts[placeholderIndex]}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
              />
              <button type="submit" className="prompt-submit-btn" title="Send to Westy">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>

            {/* Mode Tabs (From Verseo Remix) */}
            <div className="hero-mode-tabs">
              <button 
                type="button" 
                className={`mode-tab-btn ${activeMode === 'yoruba' ? 'active' : ''}`}
                onClick={() => { playTick(); setActiveMode('yoruba'); }}
              >
                🇳🇬 Yoruba Mode
              </button>
              <button 
                type="button" 
                className={`mode-tab-btn ${activeMode === 'igbo' ? 'active' : ''}`}
                onClick={() => { playTick(); setActiveMode('igbo'); }}
              >
                🇳🇬 Igbo Mode
              </button>
              <button 
                type="button" 
                className={`mode-tab-btn ${activeMode === 'hausa' ? 'active' : ''}`}
                onClick={() => { playTick(); setActiveMode('hausa'); }}
              >
                🇳🇬 Hausa Mode
              </button>
              <button 
                type="button" 
                className={`mode-tab-btn ${activeMode === 'pidgin' ? 'active' : ''}`}
                onClick={() => { playTick(); setActiveMode('pidgin'); }}
              >
                ✨ Naija Pidgin
              </button>
              <button 
                type="button" 
                className={`mode-tab-btn ${activeMode === 'code' ? 'active' : ''}`}
                onClick={() => { playTick(); setActiveMode('code'); }}
              >
                💻 Code Architect
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 
        ============================================================
        LOWER SECTIONS: BACKED DIRECTLY BY THE 2ND DARK REMIX TEMPLATE
        (Volumetric Storm Clouds, Aurora Light Rays & Luminous Glass)
        ============================================================ 
      */}
      <div className="clouds-showcase-container">
        <div className="clouds-backdrop-asset">
          <img src="/clouds-backdrop.jpg" alt="Volumetric Aurora Clouds" className="clouds-bg-img" />
          <div className="clouds-gradient-overlay"></div>
        </div>

        {/* Interactive Workspace Showcase */}
        <section id="demo" className="landing-section demo-section">
        <div className="section-header">
          <span className="section-tag">Interactive Simulation</span>
          <h2 className="section-title">Experience real-time intelligence in action.</h2>
          <p className="section-subtitle">Toggle through dialect modes to see how Westy reasons across diverse African languages and complex software logic.</p>
        </div>

        <div className="hero-preview-frame remixed-window glass-strong">
          <div className="preview-window-bar">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="window-title-flex">
              <span className="window-pulse-dot"></span>
              <span>Westy Workspace — Live Multilingual Stream</span>
            </div>
            <div className="window-actions-right">
              <button 
                className="btn-window-action"
                onClick={() => handleLaunchWithPrompt(modeData[activeMode].userQuery)}
              >
                Launch in App ↗
              </button>
            </div>
          </div>

          <div className="preview-split-grid">
            {/* Left Column: Conversational Dialogue */}
            <div className="preview-dialogue-pane">
              <div className="dialogue-tag-header">
                <span>{modeData[activeMode].tag}</span>
              </div>

              {/* User Bubble */}
              <div className="interactive-bubble user-bubble animate-fadeIn">
                <span className="bubble-speaker">👤 User Query</span>
                <p className="bubble-text">{modeData[activeMode].userQuery}</p>
              </div>

              {/* AI Bubble */}
              <div className="interactive-bubble ai-bubble animate-fadeIn">
                <div className="ai-speaker-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="var(--accent)" />
                  </svg>
                  <span>Westy AI Response</span>
                  <span className="stream-badge">Streaming SSE</span>
                </div>
                <p className="bubble-text">{modeData[activeMode].aiResponse}</p>
              </div>

              <div className="dialogue-quick-actions">
                <button 
                  className="quick-action-pill"
                  onClick={() => handleLaunchWithPrompt(modeData[activeMode].userQuery)}
                >
                  ⚡ Send this prompt to Westy
                </button>
              </div>
            </div>

            {/* Center Column: Animated Interactive Neural Core */}
            <div className="preview-neural-pane">
              <NeuralCoreCanvas width={250} height={200} />
              <div className="neural-stats-row">
                <div className="n-stat">
                  <span className="n-stat-val">16</span>
                  <span className="n-stat-lbl">Languages</span>
                </div>
                <div className="n-stat">
                  <span className="n-stat-val">&lt;40ms</span>
                  <span className="n-stat-lbl">Latency</span>
                </div>
                <div className="n-stat">
                  <span className="n-stat-val">Native</span>
                  <span className="n-stat-lbl">Core</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Code & Logic Preview */}
            <div className="preview-code-pane">
              <div className="code-header-row">
                <span className="code-title-text">{modeData[activeMode].codeTitle}</span>
                <button 
                  className="code-copy-action"
                  onClick={() => copyCode(modeData[activeMode].codeSnippet)}
                >
                  {isCopied ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="code-block-body">
                <code>{modeData[activeMode].codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        FEATURES SECTION (Neat & Chill — Zero Autonomous Admin Mentions)
        ============================================================ 
      */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Core Features</span>
          <h2 className="section-title">Built for depth, speed, and real intelligence.</h2>
          <p className="section-subtitle">No bloated sidebars or distracting clutter. Just sharp intelligence, cultural awareness, and clean execution.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass tilt-card">
            <div className="feature-icon-box teal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <h3>Cultural Dialect Fluency</h3>
            <p>Understands regional nuances, proverbs, and tonal expressions in Yoruba, Igbo, Hausa, and Nigerian Pidgin alongside English, French, and Spanish.</p>
          </div>

          <div className="feature-card glass tilt-card">
            <div className="feature-icon-box purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3>Instant Real-Time Streaming</h3>
            <p>Responses flow character-by-character as thoughts form with lowest possible latency, giving you an immediate, uninterrupted conversation flow.</p>
          </div>

          <div className="feature-card glass tilt-card">
            <div className="feature-icon-box blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <h3>Intelligent Code Engine</h3>
            <p>Generates production-grade Python, JavaScript, TypeScript, SQL, and algorithm structures with formatted markdown code blocks and copy controls.</p>
          </div>

          <div className="feature-card glass tilt-card">
            <div className="feature-icon-box green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <h3>Voice Dictation & Speech</h3>
            <p>Hands-free communication. Dictate your thoughts naturally with built-in voice transcription and listen to responses read back with audio synthesis.</p>
          </div>

          <div className="feature-card glass tilt-card">
            <div className="feature-icon-box amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>Multi-Turn Context Memory</h3>
            <p>Remembers prior exchanges within your session, allowing you to ask follow-up questions, refine code, and build upon ideas naturally.</p>
          </div>

          <div className="feature-card glass tilt-card">
            <div className="feature-icon-box cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>Persistent History & Isolation</h3>
            <p>Every conversation is saved locally with auto-generated titles, fast keyword search, and dedicated user isolation.</p>
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        LANGUAGES SHOWCASE (With Vivid Flag Badges)
        ============================================================ 
      */}
      <section id="languages" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Global & Regional Dialects</span>
          <h2 className="section-title">Speaks your mother tongue.</h2>
          <p className="section-subtitle">Click any language card to launch the conversation in that dialect immediately.</p>
        </div>

        <div className="languages-pills-grid">
          {languages.map((l) => (
            <div 
              key={l.code} 
              className="lang-pill-card glass interactive-lang-card"
              onClick={() => handleLaunchWithPrompt(`Hello Westy! Please converse with me in ${l.name}.`)}
              title={`Start chatting in ${l.name}`}
            >
              <FlagBadge code={l.code} size={26} />
              <span className="lang-pill-name">{l.name}</span>
              <span className="lang-pill-code">{l.code.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>

      {/* Bottom CTA */}
      <section className="landing-cta-section">
        <div className="cta-box glass-strong glow-cta">
          <h2 className="cta-title">Experience conversational clarity.</h2>
          <p className="cta-subtitle">Jump straight into the chat and explore intelligent multi-lingual conversations today.</p>
          <button 
            onClick={() => { playPop(); navigate(user ? '/chat' : '/signup'); }} 
            className="btn hero-btn-main glow-hover"
          >
            Launch Chat App →
          </button>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="gradient-text font-bold">Westy</span>
            <span className="footer-copy">© {new Date().getFullYear()} — Intelligent conversational platform.</span>
          </div>
          <div className="footer-links">
            {user?.isAdmin && <Link to="/admin" onClick={() => playTick()}>Admin Portal</Link>}
            <Link to="/chat" onClick={() => playTick()}>Chat Interface</Link>
            <Link to={user ? "/chat" : "/login"} onClick={() => playTick()}>{user ? "My Account" : "Sign In"}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
