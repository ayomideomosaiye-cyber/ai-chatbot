import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../../utils/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await apiGet('/admin/users');
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const toggleBan = async (id, isBanned) => {
    try {
      const updatedUser = await apiPut(`/admin/users/${id}/ban`, { banned: !isBanned });
      setUsers(users.map(u => u.id === id || u._id === id ? { ...u, isBanned: !isBanned } : u));
    } catch (error) {
      console.error('Error toggling ban status:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.username && u.username.toLowerCase().includes(search.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="users-page">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 className="admin-page-title" style={{ margin: 0 }}>Users</h1>
          <span className="badge badge-blue" style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}>
            {users.length} total
          </span>
        </div>
      </div>

      <div className="table-header" style={{ marginBottom: '16px' }}>
        <input 
          type="text" 
          className="table-search" 
          placeholder="Search users..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '300px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="data-table glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={{ padding: '16px' }}>User</th>
                <th style={{ padding: '16px' }}>Email</th>
                <th style={{ padding: '16px' }}>Messages</th>
                <th style={{ padding: '16px' }}>Language</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id || user._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td className="user-cell" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-cell-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span>{user.username}</span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>{user.messageCount || 0}</td>
                  <td style={{ padding: '16px' }}>{user.preferredLanguage || 'English'}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={`status-badge ${user.isAdmin ? 'admin' : user.isBanned ? 'banned' : 'active'}`} style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: user.isAdmin ? 'rgba(123, 44, 191, 0.1)' : user.isBanned ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: user.isAdmin ? 'var(--accent-purple)' : user.isBanned ? '#ef4444' : '#10b981'
                    }}>
                      {user.isAdmin ? 'Admin' : user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {!user.isAdmin && (
                      <button 
                        className="action-btn"
                        onClick={() => toggleBan(user.id || user._id, user.isBanned)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: user.isBanned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: user.isBanned ? '#10b981' : '#ef4444', fontWeight: '500' }}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
