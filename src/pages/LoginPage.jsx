import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import WestyBrandMark from '../components/WestyBrandMark';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [rememberedEmail, setRememberedEmail] = useState(() => localStorage.getItem('westy_remembered_email') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('westy_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  const handleForgetEmail = () => {
    localStorage.removeItem('westy_remembered_email');
    setRememberedEmail('');
    setEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>
      <div className="auth-card glass">
        <div style={{ textAlign: 'left', marginBottom: '16px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ← Back to Home
          </Link>
        </div>
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <WestyBrandMark size={32} />
          <span className="gradient-text">Westy</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue your conversations</p>
        
        {rememberedEmail && (
          <div className="remembered-account-chip">
            <span>Signed out from <strong>{rememberedEmail}</strong></span>
            <button 
              type="button" 
              onClick={handleForgetEmail} 
              className="chip-forget-btn" 
              title="Forget this email on this device"
            >
              ✕
            </button>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="auth-btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <GoogleSignInButton />
        
        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
