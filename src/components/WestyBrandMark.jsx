import React from 'react';

/**
 * WestyBrandMark
 * 
 * Minimalist, authentic, futuristic geometric tech logo for Westy.
 * Concept: 
 *  - A dual-fold geometric nexus forming an abstract 'W' that doubles as an open dimensional beacon.
 *  - Clean architectural facets with precision micro-gaps (1.5px).
 *  - High-tech cyber teal (#00f5d4) to deep neon ultraviolet gradient with radiant inner core.
 *  - Scales seamlessly from 16px favicon up to high-res display banners.
 */
export default function WestyBrandMark({ size = 28, className = '' }) {
  const gradientId = `westy-brand-grad-${size}`;
  const glowId = `westy-glow-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`westy-brand-mark ${className}`}
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}
    >
      <defs>
        {/* Sleek Cyber Gradient */}
        <linearGradient id={gradientId} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f5d4" />
          <stop offset="50%" stopColor="#00c8b3" />
          <stop offset="100%" stopColor="#7b2cbf" />
        </linearGradient>

        <linearGradient id={`${gradientId}-right`} x1="28" y1="4" x2="8" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        {/* Ambient Subtle Glow */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Micro-Hex Grid Subtle Tech Chassis */}
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8"
        fill="rgba(255, 255, 255, 0.03)"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="1"
      />

      <g filter={`url(#${glowId})`}>
        {/* Left Wing Facet (West flank of the 'W') */}
        <path
          d="M6.5 8.5L10 23.5L13.5 15.5L10 8.5H6.5Z"
          fill={`url(#${gradientId})`}
          fillOpacity="0.95"
        />

        {/* Right Wing Facet (East flank of the 'W') */}
        <path
          d="M25.5 8.5L22 23.5L18.5 15.5L22 8.5H25.5Z"
          fill={`url(#${gradientId}-right)`}
          fillOpacity="0.95"
        />

        {/* Center Quantum Beacon / Apex Chevron */}
        <path
          d="M16 11.5L12.8 22H19.2L16 11.5Z"
          fill="#ffffff"
          fillOpacity="0.98"
        />

        {/* Precision Micro-Core (Active Quantum Point) */}
        <circle cx="16" cy="18.5" r="1.3" fill="#00f5d4" />
      </g>
    </svg>
  );
}
