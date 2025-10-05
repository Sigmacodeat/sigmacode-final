'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';

type Locale = 'de' | 'en';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const [open, setOpen] = React.useState(false);
  const [locale, setLocale] = React.useState<Locale>('de');

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('app.locale') as Locale | null;
      if (saved === 'de' || saved === 'en') setLocale(saved);
    } catch {}
  }, []);

  const apply = (l: Locale) => {
    setLocale(l);
    try {
      localStorage.setItem('app.locale', l);
      window.dispatchEvent(new CustomEvent('locale:change', { detail: { locale: l } }));
    } catch {}
    setOpen(false);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs focus:outline-none focus-visible:ring-2"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--fg)',
          ['--tw-ring-color' as any]: 'var(--ring)',
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5" />
        {locale.toUpperCase()}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute z-50 mt-1 min-w-[120px] overflow-hidden rounded-md border bg-[color:var(--card)] p-1 text-xs shadow-lg"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            type="button"
            className={`block w-full rounded px-2 py-1 text-left hover:bg-[color:var(--muted)] ${locale === 'de' ? 'bg-[color:var(--muted)]' : ''}`}
            onClick={() => apply('de')}
          >
            Deutsch
          </button>
          <button
            type="button"
            className={`block w-full rounded px-2 py-1 text-left hover:bg-[color:var(--muted)] ${locale === 'en' ? 'bg-[color:var(--muted)]' : ''}`}
            onClick={() => apply('en')}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}
