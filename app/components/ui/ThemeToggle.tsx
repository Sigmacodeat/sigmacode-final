'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function applyTheme(theme: Theme) {
  try {
    const el = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = theme === 'dark' || (theme === 'system' && systemDark);
    if (shouldDark) el.classList.add('dark');
    else el.classList.remove('dark');
  } catch {}
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    try {
      const stored = (localStorage.getItem('theme') as Theme) || 'system';
      setTheme(stored);
      applyTheme(stored);
    } catch {}
  }, []);

  function setAndApply(next: Theme) {
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
    applyTheme(next);
  }

  function cycle() {
    const order: Theme[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    setAndApply(next);
  }

  // Reagiere auf Systemwechsel, wenn 'system' aktiv ist
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        const stored = (localStorage.getItem('theme') as Theme) || 'system';
        if (stored === 'system') applyTheme('system');
      };
      mq.addEventListener?.('change', handler);
      return () => mq.removeEventListener?.('change', handler);
    } catch {}
  }, []);

  const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';
  const icon =
    theme === 'light' ? (
      // Sonne
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ) : theme === 'dark' ? (
      // Mond
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ) : (
      // Monitor (System)
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
        <path d="M8 22h8" />
      </svg>
    );

  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${label}`}
      aria-live="polite"
      title={`Theme: ${label} (klicken zum Wechseln)`}
      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 backdrop-blur-sm bg-white/70 dark:bg-zinc-900/70 transition-all duration-300 group relative overflow-hidden"
      style={
        {
          borderColor: 'var(--border)',
          color: 'var(--fg)',
          '--tw-ring-color': 'var(--ring)',
        } as React.CSSProperties
      }
    >
      {/* Flüssiger Glanz-Effekt */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Subtiler Neon-Akzent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <span
        aria-hidden="true"
        className="inline-flex h-4 w-4 items-center justify-center transition-transform duration-200 group-hover:scale-110"
      >
        {icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
