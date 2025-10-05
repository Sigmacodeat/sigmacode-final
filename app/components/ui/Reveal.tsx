'use client';

import { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
}

export function Reveal({ children, delayMs = 0 }: RevealProps) {
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduced(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
      mq.addEventListener?.('change', handler);
      return () => mq.removeEventListener?.('change', handler);
    } catch {}
  }, []);

  useEffect(() => {
    if (reduced) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={
        reduced
          ? ''
          : `transition-all duration-700 ease-out will-change-transform ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`
      }
    >
      {children}
    </div>
  );
}
