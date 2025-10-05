'use client';

import { useEffect, useState } from 'react';

export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur transition-transform md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="text-sm text-zinc-700">Starte im Shadow‑Modus – ohne Risiko.</div>
        <a href="#try" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          Abo starten
        </a>
      </div>
    </div>
  );
}
