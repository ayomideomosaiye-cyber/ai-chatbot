import React, { useState, useRef } from 'react';
import { playPop, playTick } from '../utils/audio';

export default function VideoShowcaseFrame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    playPop();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If video file is not yet uploaded in public/westy-demo.mp4
          setHasError(true);
          setIsPlaying(false);
        });
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="hero-video-frame glass-strong">
      {/* macOS / Linear Studio Header Chassis */}
      <div className="video-window-bar">
        <div className="window-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
        
        <div className="video-address-capsule">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="address-text">westy.ai / product-walkthrough</span>
        </div>

        <div className="video-status-indicator">
          <span className={`live-pulse-dot ${isPlaying ? 'playing' : ''}`}></span>
          <span className="status-label">{isPlaying ? 'Playing' : 'Ready'}</span>
        </div>
      </div>

      {/* Video Viewport Container */}
      <div className="video-viewport-wrapper">
        <video
          ref={videoRef}
          className="showcase-video-element"
          poster="/hero-remix.jpg"
          playsInline
          controls={isPlaying}
          onEnded={handleVideoEnded}
          onError={() => setHasError(true)}
        >
          <source src="/westy-demo.mp4" type="video/mp4" />
          Your browser does not support high-definition video playback.
        </video>

        {/* Custom Frosted Play Overlay (shown when paused or before start) */}
        {!isPlaying && (
          <div className="video-play-overlay" onClick={togglePlay}>
            <div className="play-button-glass glow-hover" title="Play Walkthrough Video">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>

            <div className="video-overlay-info">
              <span className="overlay-badge">4K Walkthrough Video</span>
              <h3 className="overlay-title">Watch Westy in Real-World Action</h3>
              <p className="overlay-description">
                Deep multilingual reasoning, instantaneous SSE streaming, and voice input demonstration.
              </p>
              {hasError && (
                <div className="video-upload-tip">
                  <span>💡 Tip: Place your screen recording at <code>public/westy-demo.mp4</code> and it will stream right here!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
