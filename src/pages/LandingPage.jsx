import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { languages } from '../utils/languages';
import FlagBadge from '../components/FlagBadge';
import VerticalWordRoller from '../components/VerticalWordRoller';
import VideoShowcaseFrame from '../components/VideoShowcaseFrame';
import { playPop, playTick } from '../utils/audio';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLaunchWithPrompt = (promptText) => {
    playPop();
    localStorage.setItem('westy_initial_prompt', promptText);
    navigate(user ? '/chat' : '/login');
  };

  return (
    <div className="landing-page remixed-theme">
      {/* 
        ============================================================
        HERO SECTION: ELEGANT MOODY ATMOSPHERIC BACKDROP & CLEAN HERO
        ============================================================ 
      */}
      <div className="portal-hero-container">
        {/* Sleek Atmospheric Portal Artwork Backdrop */}
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
            <a href="#showcase">Demo Showcase</a>
            <a href="#features">Features</a>
            <a href="#languages">Languages</a>
          </nav>

          <div className="landing-nav-actions">
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

        {/* Clean, Impactful Hero Content */}
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
            Intelligent conversational AI engineered for deep contextual reasoning, production code, and fluent native languages.
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
            <a href="#showcase" className="btn btn-secondary hero-btn-sub" onClick={() => playTick()}>
              Watch Demo Video ↓
            </a>
          </div>
        </div>
      </div>

      {/* 
        ============================================================
        STUDIO VIDEO SHOWCASE SECTION
        ============================================================ 
      */}
      <section id="showcase" className="landing-section showcase-section">
        <div className="section-header">
          <span className="section-tag">Studio Showcase</span>
          <h2 className="section-title">See Westy in action.</h2>
          <p className="section-subtitle">A high-definition walkthrough of real-time streaming, multilingual reasoning, and intelligent voice interaction.</p>
        </div>

        {/* Dedicated 16:9 Video Frame Chassis */}
        <VideoShowcaseFrame />
      </section>

      {/* 
        ============================================================
        FEATURES SECTION (Sharp, Minimal, Production-Grade)
        ============================================================ 
      */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Core Capabilities</span>
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
            <h3>Voice Waves & Speech</h3>
            <p>Hands-free audio communication. Dictate your thoughts naturally with live waveform visualization and listen to responses read back with speech synthesis.</p>
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
            <p>Every conversation is saved with auto-generated titles, fast keyword search, and dedicated private user isolation.</p>
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
