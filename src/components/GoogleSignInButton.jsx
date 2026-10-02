import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) {
      // If GSI not loaded yet, retry after a delay
      const timer = setTimeout(() => {
        if (window.google?.accounts?.id && clientId) {
          initGoogle(clientId);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    initGoogle(clientId);
  }, []);

  function initGoogle(clientId) {
    if (initialized.current) return;
    initialized.current = true;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    if (btnRef.current) {
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: btnRef.current.offsetWidth || 320,
        text: 'continue_with',
        shape: 'pill',
      });
    }
  }

  async function handleCredentialResponse(response) {
    try {
      await loginWithGoogle(response.credential);
      navigate('/chat');
    } catch (err) {
      console.error('Google sign-in failed:', err);
      alert(err.message || 'Google sign-in failed');
    }
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return null; // Don't render if no client ID configured

  return (
    <div className="google-signin-wrapper">
      <div className="auth-divider">
        <span className="auth-divider-line"></span>
        <span className="auth-divider-text">or</span>
        <span className="auth-divider-line"></span>
      </div>
      <div ref={btnRef} className="google-signin-btn"></div>
    </div>
  );
}
