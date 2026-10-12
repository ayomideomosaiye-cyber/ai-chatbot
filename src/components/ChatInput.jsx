import React, { useRef, useEffect, useState } from 'react';
import { playPop, playTick } from '../utils/audio';

export default function ChatInput({ value, onChange, onSend, onVoiceInput, isListening = false }) {
  const [selectedMedia, setSelectedMedia] = useState(null); // { file, name, size, isVideo, previewUrl, base64, mimeType }
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    onVoiceInput();
  };

  const processFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please upload an image (PNG, JPEG, WebP, GIF) or a video clip (MP4, WebM, MOV).');
      return;
    }

    // Vercel serverless request body limit is 4.5MB. Base64 encoding adds ~33% overhead.
    if (file.size > 3.5 * 1024 * 1024) {
      alert(`The selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.\n\nDue to Vercel cloud serverless payload limits (4.5MB ceiling for serverless HTTP requests), please select an image or video clip up to ~3.5MB.`);
      return;
    }

    playTick();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(',')[1];
      setSelectedMedia({
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
        mimeType: file.type,
        isVideo,
        dataUrl,
        base64
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('video') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    }
  };

  const clearMedia = () => {
    playTick();
    setSelectedMedia(null);
  };

  const handleSend = () => {
    if (!value.trim() && !selectedMedia) return;
    const payload = {
      text: value.trim(),
      image: selectedMedia ? { 
        data: selectedMedia.base64, 
        mimeType: selectedMedia.mimeType, 
        previewUrl: selectedMedia.dataUrl,
        isVideo: selectedMedia.isVideo,
        name: selectedMedia.name
      } : null
    };
    setSelectedMedia(null);
    onSend(payload);
  };

  return (
    <div className="chat-input-container">
      {/* Media Preview Floating Chip */}
      {selectedMedia && (
        <div className="input-image-preview glass">
          {selectedMedia.isVideo ? (
            <video src={selectedMedia.dataUrl} className="preview-thumb preview-video-thumb" muted autoPlay loop playsInline />
          ) : (
            <img src={selectedMedia.dataUrl} alt="Attached Preview" className="preview-thumb" />
          )}
          <div className="preview-meta">
            <span className="preview-name">{selectedMedia.name}</span>
            <span className="preview-size">
              {selectedMedia.size} · {selectedMedia.isVideo ? 'Multimodal Video' : 'Multimodal Vision'}
            </span>
          </div>
          <button 
            className="preview-remove-btn" 
            onClick={clearMedia}
            title="Remove attachment"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      <div className="chat-input-wrapper glass">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/png, image/jpeg, image/webp, image/gif, video/mp4, video/webm, video/quicktime" 
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Upload Attachment Button */}
        <button 
          type="button"
          className={`chat-action-icon-btn ${selectedMedia ? 'active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          title="Upload image or video clip (Multimodal Analysis)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        {/* Voice Input Button */}
        <button 
          type="button"
          className={`chat-voice-btn ${isListening ? 'active listening' : ''}`} 
          onClick={handleVoiceToggle}
          title={isListening ? "Listening... Click to stop" : "Use Voice Input"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={selectedMedia ? `Ask Westy about this ${selectedMedia.isVideo ? 'video' : 'image'}...` : "Message Westy (or attach media)..."}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={1}
        />

        {/* Send Button */}
        <button 
          type="button"
          className="chat-send-btn" 
          onClick={handleSend}
          disabled={!value.trim() && !selectedMedia}
          style={{ background: (value.trim() || selectedMedia) ? 'var(--accent-gradient)' : 'var(--bg-tertiary)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
