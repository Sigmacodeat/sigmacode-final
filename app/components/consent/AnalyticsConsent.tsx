'use client';

import { useEffect, useState } from 'react';

export function AnalyticsConsent() {
  const [visible, setVisible] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('analytics-consent');
      setChoice(stored);
      if (!stored) setVisible(true);
    } catch {}
  }, []);

  const accept = () => {
    try {
      localStorage.setItem('analytics-consent', 'granted');
      setChoice('granted');
    } catch {}
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem('analytics-consent', 'denied');
      setChoice('denied');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-6">
      <div className="mx-auto max-w-3xl rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-sm text-slate-700 dark:text-slate-200">
            Wir verwenden anonymisiertes Analytics zur Verbesserung der Website. Mit Klick auf
            "Akzeptieren" aktivierst du erweitertes Tracking (Web Vitals, Performance,
            Interaktionen). Du kannst diese Einstellung später in deinem Browser löschen.
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={decline}
              className="px-3 py-2 text-sm rounded-md border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Ablehnen
            </button>
            <button
              onClick={accept}
              className="px-3 py-2 text-sm rounded-md bg-[var(--brand-start)] text-white hover:opacity-90"
            >
              Akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
