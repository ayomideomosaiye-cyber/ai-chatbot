import React from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div className="glass" style={{ padding: '40px', borderRadius: '20px', textAlign: 'center', maxWidth: '420px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Admin Access Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            This portal is restricted to authorized administrators. Please sign in with an administrator account to view telemetry and conversations.
          </p>
          <Link to="/chat" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '12px', display: 'inline-block', fontWeight: 600 }}>
            Return to Chat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <div className="admin-logo">
          <Link to="/chat">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
            </svg>
            <span className="gradient-text">Westy</span>
            <span>Admin</span>
          </Link>
        </div>
        
        <div className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Users
          </NavLink>
          <NavLink to="/admin/conversations" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Conversations
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </NavLink>
          
          <hr className="divider" style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '16px 0' }} />
          
          <Link to="/chat" className="admin-nav-item admin-back-link">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Chat
          </Link>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-user-badge">
            <div className="admin-user-avatar">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <span>{user?.username || 'Admin'}</span>
          </div>
        </div>
      </nav>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
