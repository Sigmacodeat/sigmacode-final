'use client';

import { useCallback, useEffect, useState } from 'react';

export type FirewallMode = 'enforce' | 'shadow' | 'off';
export type DefaultPolicy = 'strict' | 'balanced' | 'permissive';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface FirewallConfig {
  enabled: boolean;
  mode: FirewallMode;
  defaultPolicy: DefaultPolicy;
  sampling: number;
  failOpen: boolean;
  logLevel: LogLevel;
  redactionToken: string;
  circuitBreakerEnabled: boolean;
  retryAttempts: number;
  cacheEnabled: boolean;
}

export function useFirewallConfig() {
  const [config, setConfig] = useState<FirewallConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/firewall/config', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // API kann entweder { ...config } oder { config: {...} } liefern -> beides unterstützen
      const cfg: FirewallConfig = (data?.config ?? data) as FirewallConfig;
      setConfig(cfg);
    } catch (e: any) {
      setError(e?.message || 'Konfiguration konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (update: Partial<FirewallConfig>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/firewall/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const cfg: FirewallConfig = (data?.config ?? data) as FirewallConfig;
      setConfig(cfg);
      return { ok: true } as const;
    } catch (e: any) {
      setError(e?.message || 'Speichern fehlgeschlagen');
      return { ok: false, error: e?.message } as const;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { config, loading, error, reload: load, save, saving };
}
