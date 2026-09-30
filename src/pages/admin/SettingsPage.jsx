import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../../utils/api';
import { languages } from '../../utils/languages';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    systemPrompt: 'You are Westy, a helpful AI assistant...',
    welcomeMessage: 'Hello! I am Westy. How can I help you today?',
    model: 'gemini-flash-lite-latest',
    maxTokens: 2048,
    temperature: 0.7,
    defaultLanguage: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await apiGet('/admin/settings');
        if (data) setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiPut('/admin/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'range' || type === 'number' ? Number(value) : value
    });
  };

  return (
    <div className="settings-page">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Settings</h1>
        <button 
          className="btn btn-primary" 
          onClick={save} 
          disabled={saving}
          style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-gradient)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="settings-saved" style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          ✓ Settings saved successfully
        </div>
      )}

      {loading ? (
        <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
      ) : (
        <div className="settings-sections" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="settings-section glass" style={{ padding: '24px', borderRadius: '12px' }}>
            <h3 className="settings-section-title" style={{ marginBottom: '20px' }}>🤖 AI Personality</h3>
            
            <div className="settings-field" style={{ marginBottom: '20px' }}>
              <label className="settings-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>System Prompt</label>
              <textarea 
                className="settings-textarea" 
                name="systemPrompt"
                rows="6" 
                value={settings.systemPrompt || ''} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', resize: 'vertical' }}
              />
            </div>
            
            <div className="settings-field">
              <label className="settings-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Welcome Message</label>
              <input 
                type="text"
                className="settings-input" 
                name="welcomeMessage"
                value={settings.welcomeMessage || ''} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="settings-section glass" style={{ padding: '24px', borderRadius: '12px' }}>
            <h3 className="settings-section-title" style={{ marginBottom: '20px' }}>⚙️ Generation Settings</h3>
            
            <div className="settings-field" style={{ marginBottom: '20px' }}>
              <label className="settings-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Model</label>
              <select 
                className="settings-select" 
                name="model"
                value={settings.model || 'gemini-flash-lite-latest'} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                <option value="gemini-flash-lite-latest">gemini-flash-lite-latest</option>
                <option value="gemini-flash-latest">gemini-flash-latest</option>
                <option value="gemini-pro-latest">gemini-pro-latest</option>
              </select>
            </div>
            
            <div className="settings-field" style={{ marginBottom: '20px' }}>
              <label className="settings-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Max Tokens: {settings.maxTokens}</label>
              <input 
                type="range"
                className="settings-range" 
                name="maxTokens"
                min="256" 
                max="8192" 
                step="256" 
                value={settings.maxTokens || 2048} 
                onChange={handleChange}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>
            
            <div className="settings-field">
              <label className="settings-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Temperature: {settings.temperature}</label>
              <input 
                type="range"
                className="settings-range" 
                name="temperature"
                min="0" 
                max="2" 
                step="0.1" 
                value={settings.temperature || 0.7} 
                onChange={handleChange}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>
          </div>

          <div className="settings-section glass" style={{ padding: '24px', borderRadius: '12px' }}>
            <h3 className="settings-section-title" style={{ marginBottom: '20px' }}>🌍 Language</h3>
            
            <div className="settings-field">
              <label className="settings-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Default Language</label>
              <select 
                className="settings-select" 
                name="defaultLanguage"
                value={settings.defaultLanguage || 'en'} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
