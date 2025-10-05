'use client';

import { useEffect, useState } from 'react';

export function useDifyHealth(difyUrl: string) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      setLoading(true);
      try {
        // Verwende internen Proxy, um CORS zu vermeiden
        const res = await fetch(`/api/dify/ping`, { cache: 'no-store' });
        if (!mounted) return;
        setOk(res.ok);
      } catch {
        if (!mounted) return;
        setOk(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    check();
    const t = setInterval(check, 30000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return { ok, loading };
}
