import React, { useState, useEffect, useRef } from 'react';

export default function MotionCursor() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('westy_cursor_fx') !== 'false';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef(null);

  // Sync with global toggle event
  useEffect(() => {
    const handleToggle = (e) => {
      if (typeof e.detail?.enabled === 'boolean') {
        setEnabled(e.detail.enabled);
      }
    };
    window.addEventListener('westy-cursor-toggle', handleToggle);
    return () => window.removeEventListener('westy-cursor-toggle', handleToggle);
  }, []);

  useEffect(() => {
    // If disabled or on mobile touch device without hover capability, skip
    if (!enabled || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) {
      return;
    }

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering over clickable / interactive elements
      const target = e.target;
      const isInteractive = target && (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('.interactive-hover') ||
        target.closest('.glass') ||
        target.closest('.sidebar-item') ||
        target.closest('.dialect-pill')
      );
      setIsHovered(!!isInteractive);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth lerp loop for the trailing fluid ring
    const render = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.16;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [enabled, isVisible]);

  if (!enabled) return null;

  return (
    <div className={`motion-cursor-root ${isVisible ? 'visible' : ''}`} pointer-events="none">
      {/* Precision Center Glow Dot */}
      <div 
        ref={dotRef} 
        className={`motion-cursor-dot ${isHovered ? 'hovered' : ''} ${isClicking ? 'clicking' : ''}`}
      />
      {/* Smooth Trailing Ethereal Aura Ring */}
      <div 
        ref={ringRef} 
        className={`motion-cursor-ring ${isHovered ? 'hovered' : ''} ${isClicking ? 'clicking' : ''}`}
      >
        <div className="motion-cursor-glow" />
      </div>
    </div>
  );
}

// Global toggle helper function
export function toggleMotionCursor() {
  const current = localStorage.getItem('westy_cursor_fx') !== 'false';
  const updated = !current;
  localStorage.setItem('westy_cursor_fx', String(updated));
  window.dispatchEvent(new CustomEvent('westy-cursor-toggle', { detail: { enabled: updated } }));
  return updated;
}

export function isMotionCursorEnabled() {
  return localStorage.getItem('westy_cursor_fx') !== 'false';
}
