'use client';

import { useEffect, useState } from 'react';

export type FirewallLiveStats = {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  averageLatency: number;
  topThreats: Array<{ category: string; count: number }>; // optional in UI
  isEnabled: boolean;
  mode: 'enforce' | 'shadow' | 'off';
};

export function useFirewallLiveStats(intervalMs = 5000) {
  const [data, setData] = useState<FirewallLiveStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const res = await fetch('/api/firewall/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as FirewallLiveStats;
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
    if (intervalMs > 0) {
      timer = setInterval(load, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { data, loading, error, reload: load };
}
