'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * Very small A/B helper.
 * Priority:
 * 1) Query param (?ab=1|2 or ?cta=1|2)
 * 2) LocalStorage persisted choice (key: ab-variant)
 * 3) Random assignment with 50/50 split
 */
export function useABFlag(key: string = 'cta', variants: [string, string] = ['v1', 'v2']) {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const qp = url.searchParams.get(key) || url.searchParams.get('ab');
      if (qp && (qp === '1' || qp === '2')) {
        const chosen = qp === '1' ? variants[0] : variants[1];
        localStorage.setItem(`ab-${key}`, chosen);
        setVariant(chosen);
        return;
      }
      const ls = localStorage.getItem(`ab-${key}`);
      if (ls && (ls === variants[0] || ls === variants[1])) {
        setVariant(ls);
        return;
      }
      const rand = Math.random() < 0.5 ? variants[0] : variants[1];
      localStorage.setItem(`ab-${key}`, rand);
      setVariant(rand);
    } catch {
      // fallback if blocked
      setVariant(variants[0]);
    }
  }, [key, variants]);

  return useMemo(
    () => ({
      variant: variant ?? variants[0],
      isV1: (variant ?? variants[0]) === variants[0],
      isV2: (variant ?? variants[0]) === variants[1],
    }),
    [variant, variants],
  );
}
