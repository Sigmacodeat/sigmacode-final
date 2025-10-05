'use client';

import * as React from 'react';
import { ShieldCheck, ShieldAlert, WifiOff, Wifi } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

type Status = 'online' | 'degraded' | 'offline' | 'unknown';

interface FirewallStatusProps {
  pollMs?: number; // how often to refresh
  endpoint?: string; // health endpoint
  className?: string;
}

export function FirewallStatus({
  pollMs = 20000,
  endpoint = '/api/firewall/health',
  className,
}: FirewallStatusProps) {
  const [status, setStatus] = React.useState<Status>('unknown');
  const [latency, setLatency] = React.useState<number | null>(null);

  const check = React.useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const start = performance.now();
    try {
      const res = await fetch(endpoint, { signal: controller.signal, cache: 'no-store' });
      const ms = Math.max(0, Math.round(performance.now() - start));
      setLatency(ms);
      if (!res.ok) {
        setStatus(ms < 2000 ? 'degraded' : 'offline');
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { online?: boolean };
      const online = data.online ?? true; // default optimistic
      if (online) setStatus(ms < 1200 ? 'online' : 'degraded');
      else setStatus('offline');
    } catch (e) {
      setLatency(null);
      setStatus('offline');
    } finally {
      clearTimeout(timeout);
    }
  }, [endpoint]);

  React.useEffect(() => {
    check();
    const id = setInterval(check, pollMs);
    return () => clearInterval(id);
  }, [check, pollMs]);

  const icon = (() => {
    switch (status) {
      case 'online':
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case 'degraded':
        return <Wifi className="h-3.5 w-3.5" />;
      case 'offline':
        return <WifiOff className="h-3.5 w-3.5" />;
      default:
        return <ShieldAlert className="h-3.5 w-3.5" />;
    }
  })();

  const tone =
    status === 'online'
      ? 'success'
      : status === 'degraded'
        ? 'warning'
        : status === 'offline'
          ? 'error'
          : 'neutral';
  const label =
    status === 'online'
      ? 'Firewall Online'
      : status === 'degraded'
        ? 'Firewall Degraded'
        : status === 'offline'
          ? 'Firewall Offline'
          : 'Firewall';

  return (
    <div className={className} title={latency != null ? `Latency ${latency}ms` : undefined}>
      <StatusBadge label={label} tone={tone} size="sm" icon={icon} />
    </div>
  );
}
