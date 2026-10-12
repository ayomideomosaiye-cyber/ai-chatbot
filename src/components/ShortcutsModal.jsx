import React from 'react';
import { playTick } from '../utils/audio';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + M', desc: 'Toggle Voice Input (Start / Stop listening)' },
    { key: 'Enter', desc: 'Send message (when input is focused)' },
    { key: 'Shift + Enter', desc: 'Insert new line in message' },
    { key: 'Ctrl + N', desc: 'Start a new conversation' },
    { key: 'Ctrl + K', desc: 'Focus message input' },
    { key: 'Ctrl + /', desc: 'Open / close keyboard shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Cancel voice recording or close modals' }
  ];

  return (
    <div className="shortcuts-modal-backdrop" onClick={onClose}>
      <div className="shortcuts-modal-card glass-strong" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <div className="shortcuts-title-group">
            <span className="shortcuts-icon">⌨️</span>
            <h3>Keyboard Shortcuts</h3>
          </div>
          <button className="shortcuts-close-btn" onClick={() => { playTick(); onClose(); }}>✕</button>
        </div>

        <p className="shortcuts-modal-subtitle">
          Accelerate your workflow with Antigravity-style keyboard commands.
        </p>

        <div className="shortcuts-list">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="shortcuts-row">
              <span className="shortcuts-desc">{s.desc}</span>
              <kbd className="shortcuts-key-badge">{s.key}</kbd>
            </div>
          ))}
        </div>

        <div className="shortcuts-modal-footer">
          <span>Press <kbd className="shortcuts-key-inline">Esc</kbd> or click outside to dismiss</span>
        </div>
      </div>
    </div>
  );
}
