'use client';

import { useEffect, useState } from 'react';

export type FirewallStats = {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  averageLatency: number;
  threatMatches: number;
  topThreats: Array<{ category: string; count: number }>;
  isEnabled: boolean;
  mode: 'enforce' | 'shadow' | 'off';
};

export function useFirewallStats(opts: { refreshMs?: number } = {}) {
  const { refreshMs = 30000 } = opts;
  const [data, setData] = useState<FirewallStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const res = await fetch('/api/firewall/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as FirewallStats;
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Laden der Firewall-Statistiken');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    load();
    if (refreshMs > 0) {
      timer = setInterval(load, refreshMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs]);

  return { data, loading, error, reload: load };
}
