'use client';

import React from 'react';

export interface QuantumFirewallIconProps {
  className?: string;
  size?: number | string; // px or tailwind via className
  title?: string;
}

// Subtiler Quantum‑Neural Firewall Icon mit Verlauf passend zur Brand CI
// Farben nutzen CSS Vars, fallen bei Nichtverfügbarkeit auf definierte HEX zurück
export const QuantumFirewallIcon: React.FC<QuantumFirewallIconProps> = ({
  className,
  size = 128,
  title = 'Quantum Neural Firewall Icon',
}) => {
  const pxSize = typeof size === 'number' ? `${size}px` : size;
  const gradientStart = 'var(--quantum-start, #0A1F44)'; // Deep Blue
  const gradientMid = 'var(--quantum-mid, #1072A6)';
  const gradientEnd = 'var(--quantum-end, #00F6FF)'; // Neon Cyan

  const idSuffix = React.useId().replace(/:/g, '');
  const gradId = `qf-grad-${idSuffix}`;
  const glowId = `qf-glow-${idSuffix}`;

  return (
    <svg
      role="img"
      aria-label={title}
      width={pxSize}
      height={pxSize}
      viewBox="0 0 256 256"
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradientStart} />
          <stop offset="55%" stopColor={gradientMid} />
          <stop offset="100%" stopColor={gradientEnd} />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hintergrundring, sehr dezent */}
      <circle
        cx="128"
        cy="128"
        r="100"
        fill="none"
        stroke={`color-mix(in oklab, ${gradientEnd} 18%, transparent)`}
        strokeWidth="2"
      />

      {/* Schildkontur */}
      <path
        d="M128 28c22 14 46 21 70 24v72c0 52-40 84-70 104-30-20-70-52-70-104V52c24-3 48-10 70-24Z"
        fill={`color-mix(in oklab, ${gradientStart} 12%, transparent)`}
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        filter={`url(#${glowId})`}
      />

      {/* Neuronaler Kern: stilisierte Netzstruktur */}
      <g stroke={`url(#${gradId})`} strokeWidth="2" fill="none">
        <circle cx="128" cy="120" r="28" />
        <circle cx="92" cy="104" r="10" />
        <circle cx="164" cy="104" r="10" />
        <circle cx="108" cy="152" r="8" />
        <circle cx="148" cy="152" r="8" />
        <path d="M92 104 L100 110 L128 120 L156 110 L164 104" />
        <path d="M108 152 L120 136 L128 120 L136 136 L148 152" />
        <path d="M92 104 Q110 120 108 152" />
        <path d="M164 104 Q146 120 148 152" />
      </g>

      {/* Quantum‑Circuit Akzente */}
      <g stroke={`url(#${gradId})`} strokeWidth="2" strokeLinecap="round">
        <path d="M68 120 h20" opacity="0.8" />
        <circle cx="64" cy="120" r="2" fill={gradientEnd} />
        <path d="M168 120 h20" opacity="0.8" />
        <circle cx="192" cy="120" r="2" fill={gradientEnd} />
        <path d="M128 76 v-16" opacity="0.7" />
        <circle cx="128" cy="56" r="2" fill={gradientEnd} />
        <path d="M128 184 v16" opacity="0.7" />
        <circle cx="128" cy="204" r="2" fill={gradientEnd} />
      </g>
    </svg>
  );
};

export default QuantumFirewallIcon;
