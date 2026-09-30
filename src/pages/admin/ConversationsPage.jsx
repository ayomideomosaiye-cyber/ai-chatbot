import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/api';

function ConversationMessageItem({ msg, isUser }) {
  const [expanded, setExpanded] = useState(false);
  let rawText = msg.text || msg.content || '';
  
  // Clean suggestions tag if present
  const cleanText = rawText.replace(/<<<SUGGESTIONS:[\s\S]*?>>>/gi, '').trim();
  const isLong = cleanText.length > 300;
  const displayContent = isLong && !expanded ? cleanText.substring(0, 300) + '...' : cleanText;
  
  const imageSrc = msg.image
    ? (msg.image.dataUrl || (msg.image.data ? `data:${msg.image.mimeType || 'image/png'};base64,${msg.image.data}` : null))
    : null;

  const timeString = new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={`admin-conv-msg ${isUser ? 'user-align' : 'ai-align'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px'
      }}
    >
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px' }}>
        {isUser ? '👤 User' : '🤖 Westy AI'} · {timeString}
      </span>

      <div 
        className="glass" 
        style={{
          padding: '14px 18px',
          borderRadius: '14px',
          backgroundColor: isUser ? 'rgba(0, 245, 212, 0.12)' : 'rgba(255, 255, 255, 0.05)',
          border: isUser ? '1px solid rgba(0, 245, 212, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          lineHeight: '1.5',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      >
        {imageSrc && (
          <div style={{ marginBottom: '10px', maxWidth: '280px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src={imageSrc} alt="User attachment" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        )}
        
        <div>{displayContent || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>[No text content]</span>}</div>

        {isLong && (
          <button 
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              padding: 0,
              marginTop: '8px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'block'
            }}
          >
            {expanded ? '▲ Show less' : '▼ Read full response'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true);
        const data = await apiGet('/admin/conversations');
        const list = Array.isArray(data) ? data : [];
        setConversations(list);
        if (list.length > 0) {
          // Select first conversation by default
          selectConversation(list[0]);
        }
      } catch (error) {
        console.error('Error fetching admin conversations:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  const selectConversation = async (conv) => {
    try {
      setLoadingDetails(true);
      const convId = conv.id || conv._id;
      const data = await apiGet(`/admin/conversations/${convId}`);
      setSelectedConv(data);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      setSelectedConv(conv);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExport = () => {
    if (!selectedConv) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedConv, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `conversation_${selectedConv.id || selectedConv._id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredConversations = conversations.filter(c => 
    (c.title && c.title.toLowerCase().includes(search.toLowerCase())) ||
    (c.username && c.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="conversations-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="admin-page-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title" style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>User Conversations</h1>
          <p className="admin-page-subtitle" style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Live transcripts, multimodal uploads, and user interactions
          </p>
        </div>
        <span className="badge badge-blue" style={{ padding: '6px 12px', borderRadius: '12px', background: 'rgba(0, 245, 212, 0.12)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700 }}>
          {conversations.length} total chats
        </span>
      </div>

      <div className="conv-container" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px', flex: 1, minHeight: 0, height: 'calc(100vh - 160px)' }}>
        {/* Left Column: Conversations List */}
        <div className="conv-list-panel glass" style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-glass)' }}>
            <input 
              type="text" 
              className="table-search" 
              placeholder="Search by topic or user..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </div>
          
          <div className="conv-list" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loading ? (
              <div className="loading-spinner" style={{ margin: '30px auto' }}></div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No conversations match your search.
              </div>
            ) : filteredConversations.map(conv => {
              const isSelected = selectedConv && (selectedConv.id === conv.id || selectedConv._id === conv._id);
              const messageCount = conv.messageCount !== undefined ? conv.messageCount : (conv.messages ? conv.messages.length : 0);
              
              return (
                <div 
                  key={conv.id || conv._id} 
                  className={`conv-item ${isSelected ? 'active' : ''}`}
                  onClick={() => selectConversation(conv)}
                  style={{ 
                    padding: '12px 14px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(0, 245, 212, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(0, 245, 212, 0.3)' : '1px solid transparent',
                    marginBottom: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="conv-item-title" style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? '#fff' : 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.title || 'New Conversation'}
                  </div>
                  <div className="conv-item-meta" style={{ fontSize: '11px', color: isSelected ? 'var(--accent)' : 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>👤 {conv.username || 'User'}</span>
                    <span>·</span>
                    <span>💬 {messageCount} msgs</span>
                    <span>·</span>
                    <span>🌐 {(conv.language || 'en').toUpperCase()}</span>
                  </div>
                  <div className="conv-item-date" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(conv.updatedAt || conv.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Transcript Details */}
        <div className="conv-detail-panel glass" style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {!selectedConv ? (
            <div className="conv-empty" style={{ margin: 'auto', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
              <h3 style={{ margin: '0 0 6px', color: '#fff', fontSize: '16px' }}>Select a conversation</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>Click on any chat from the left panel to read the full conversation transcript.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="conv-detail-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 15, 26, 0.6)' }}>
                <div style={{ minWidth: 0, flex: 1, marginRight: '16px' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedConv.title || 'Untitled Conversation'}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>User: <strong>{selectedConv.username || 'User'}</strong></span>
                    <span>·</span>
                    <span>Language: <strong>{(selectedConv.language || 'en').toUpperCase()}</strong></span>
                    {selectedConv.persona && (
                      <>
                        <span>·</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Mode: {selectedConv.persona}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={handleExport}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '10px', 
                    border: '1px solid var(--border-glass-strong)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    color: '#fff', 
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Messages Body */}
              <div className="conv-detail-messages" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                {loadingDetails ? (
                  <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
                ) : (selectedConv.messages || []).length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', padding: '40px' }}>
                    No messages recorded in this conversation yet.
                  </div>
                ) : (
                  (selectedConv.messages || []).map((msg, i) => (
                    <ConversationMessageItem 
                      key={i} 
                      msg={msg} 
                      isUser={msg.role === 'user'} 
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
