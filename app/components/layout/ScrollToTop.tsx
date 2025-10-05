'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={onTop}
      aria-label="Nach oben scrollen"
      className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ease-out ${
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative">
        {/* Hintergrund-Glow */}
        <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-md scale-0 group-hover:scale-100 transition-transform duration-300" />

        {/* Haupt-Button */}
        <div className="relative rounded-full border bg-white/90 p-3 text-zinc-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900/90 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800">
          <ChevronUp className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

          {/* Subtiler Neon-Akzent */}
          <div className="absolute top-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent transition-all duration-300 group-hover:w-full" />
        </div>
      </div>
    </button>
  );
}
