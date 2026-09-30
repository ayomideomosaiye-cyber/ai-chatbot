import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await apiGet('/admin/stats');
        // fallback empty values if api is returning mock or fails to match exact schema
        setStats(data || {
          totalUsers: 0, totalMessages: 0, totalConversations: 0, activeToday: 0,
          languageBreakdown: [], recentActivity: []
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-subtitle">Welcome back, {user?.username} 👋</p>

      {loading ? (
        <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
      ) : stats ? (
        <>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="stat-card glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(0, 245, 212, 0.1)', color: 'var(--accent)', padding: '12px', borderRadius: '8px' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers || 0}</div>
                <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Users</div>
              </div>
            </div>

            <div className="stat-card glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(123, 44, 191, 0.1)', color: 'var(--accent-purple)', padding: '12px', borderRadius: '8px' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalMessages || 0}</div>
                <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Messages</div>
              </div>
            </div>

            <div className="stat-card glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '12px', borderRadius: '8px' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M3 15v4a2 2 0 0 0 2 2h14"></path></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalConversations || 0}</div>
                <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Conversations</div>
              </div>
            </div>

            <div className="stat-card glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '8px' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.activeToday || 0}</div>
                <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Active Today</div>
              </div>
            </div>
          </div>

          <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div className="chart-card glass" style={{ padding: '20px', borderRadius: '12px' }}>
              <h3 className="chart-title" style={{ marginBottom: '16px' }}>Language Usage</h3>
              <div className="chart-bars" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(Array.isArray(stats.languageBreakdown) ? stats.languageBreakdown : []).map((lang, i) => (
                  <div key={i} className="chart-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="chart-bar-label" style={{ width: '100px', fontSize: '14px', color: 'var(--text-secondary)' }}>{lang.name}</span>
                    <div className="chart-bar-track" style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="chart-bar-fill" style={{ width: `${lang.percentage}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '4px' }}></div>
                    </div>
                    <span className="chart-bar-value" style={{ width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>{lang.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card glass" style={{ padding: '20px', borderRadius: '12px' }}>
              <h3 className="chart-title" style={{ marginBottom: '16px' }}>Recent Activity</h3>
              <div className="recent-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(Array.isArray(stats.recentActivity) ? stats.recentActivity : []).map((activity, i) => (
                  <div key={i} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="activity-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {activity.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="activity-info" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="activity-title" style={{ fontWeight: '500' }}>{activity.title}</span>
                      <span className="activity-meta" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{activity.username} · {activity.time || 'Recently'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
