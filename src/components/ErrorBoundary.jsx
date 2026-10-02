import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: '#08080f', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
          padding: '24px', textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Something went wrong</h1>
          <p style={{ color: '#aaa', marginBottom: '20px', maxWidth: '480px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              // Clear service worker caches and reload
              if ('caches' in window) {
                caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
              }
              window.location.reload();
            }}
            style={{
              padding: '12px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #00f5d4, #7b2cbf)', color: '#000',
              fontWeight: 700, fontSize: '15px'
            }}
          >
            Clear Cache & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
