import React from 'react';
import { Link } from 'react-router-dom';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default function Sidebar({ conversations, activeId, onSelect, onNewChat, onDelete, user, onLogout, isOpen, onToggle }) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-new-btn" onClick={onNewChat}>
          + New Chat
        </button>
        <button className="sidebar-close-btn" onClick={onToggle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="sidebar-list">
        {conversations.map(conv => (
          <div 
            key={conv.id} 
            className={`sidebar-item ${activeId === conv.id ? 'active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <div className="sidebar-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="sidebar-item-content">
              <div className="sidebar-item-title">
                {conv.title?.length > 30 ? conv.title.substring(0, 30) + '...' : (conv.title || 'New Chat')}
              </div>
              <div className="sidebar-item-date">
                {formatRelativeTime(conv.updatedAt || conv.createdAt)}
              </div>
            </div>
            <button 
              className="sidebar-item-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              title="Delete chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.username || 'User'}</div>
              <div className="sidebar-user-email">{user.email || ''}</div>
            </div>
          </div>
        )}
        <Link to="/" className="sidebar-home-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </Link>
        {user?.isAdmin && (
          <Link to="/admin" className="sidebar-admin-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 8}}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Admin
          </Link>
        )}
        <button className="sidebar-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
