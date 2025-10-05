'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFirewallConfig, type FirewallConfig } from '@/app/hooks/useFirewallConfig';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-foreground mb-1 block">{children}</label>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}

export default function FirewallConfigForm() {
  const { config, loading, error, save, saving, reload } = useFirewallConfig();
  const params = useParams();
  const locale = (params?.locale as string) || '';
  const [local, setLocal] = useState<Partial<FirewallConfig> | null>(null);
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const { success: toastSuccess, error: toastError } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cfg: FirewallConfig | null = useMemo(() => {
    return (local as FirewallConfig) || (config as FirewallConfig) || null;
  }, [local, config]);

  if (loading) {
    return <div className="p-6 border rounded-lg bg-card animate-pulse h-64" />;
  }

  if (error) {
    return (
      <div className="p-6 border rounded-lg bg-destructive/10 text-destructive">
        Fehler beim Laden: {error}
      </div>
    );
  }

  if (!cfg) return null;

  const update = (patch: Partial<FirewallConfig>) => {
    const next = { ...(local || cfg), ...patch } as FirewallConfig;
    // simple validation
    const e: Record<string, string> = {};
    if (next.sampling < 0 || next.sampling > 1) e.sampling = 'Wert muss zwischen 0 und 1 liegen.';
    if (next.retryAttempts < 0 || next.retryAttempts > 10)
      e.retryAttempts = 'Wert muss zwischen 0 und 10 liegen.';
    if ((next.redactionToken ?? '').trim().length === 0)
      e.redactionToken = 'Redaction Token darf nicht leer sein.';
    setErrors(e);
    setLocal(next);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      toastError('Bitte beheben Sie die Validierungsfehler.', 'Neural Firewall');
      return;
    }
    const result = await save(local || {});
    if (result.ok) {
      setLocal(null);
      toastSuccess('Konfiguration gespeichert', 'Neural Firewall');
    } else {
      toastError(result.error || 'Speichern fehlgeschlagen', 'Neural Firewall');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!isAdmin && (
        <div className="p-3 rounded-md bg-amber-50 text-amber-800 text-sm border border-amber-200">
          Hinweis: Sie haben keine Admin-Rechte. Die Einstellungen sind schreibgeschützt.
        </div>
      )}
      <Row>
        <div>
          <Label>Aktiviert</Label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={cfg.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
              disabled={!isAdmin}
              className="h-4 w-4"
            />
            <span className="text-sm text-muted-foreground">
              Neural Firewall global aktivieren/deaktivieren
            </span>
          </div>
        </div>
        <div>
          <Label>Modus</Label>
          <select
            value={cfg.mode}
            onChange={(e) => update({ mode: e.target.value as FirewallConfig['mode'] })}
            disabled={!isAdmin}
            className="w-full border rounded-md p-2 bg-background"
          >
            <option value="enforce">Enforce (Blockieren)</option>
            <option value="shadow">Shadow (Beobachten)</option>
            <option value="off">Aus</option>
          </select>
        </div>
      </Row>

      <Row>
        <div>
          <Label>Default Policy</Label>
          <select
            value={cfg.defaultPolicy}
            onChange={(e) =>
              update({ defaultPolicy: e.target.value as FirewallConfig['defaultPolicy'] })
            }
            disabled={!isAdmin}
            className="w-full border rounded-md p-2 bg-background"
          >
            <option value="strict">Strict</option>
            <option value="balanced">Balanced</option>
            <option value="permissive">Permissive</option>
          </select>
        </div>
        <div>
          <Label>Sampling (0.0–1.0)</Label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={cfg.sampling}
            onChange={(e) => update({ sampling: Number(e.target.value) })}
            disabled={!isAdmin}
            className="w-full border rounded-md p-2 bg-background"
          />
          {errors.sampling && <div className="mt-1 text-xs text-red-600">{errors.sampling}</div>}
        </div>
      </Row>

      <Row>
        <div>
          <Label>Fail-Open</Label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={cfg.failOpen}
              onChange={(e) => update({ failOpen: e.target.checked })}
              disabled={!isAdmin}
              className="h-4 w-4"
            />
            <span className="text-sm text-muted-foreground">
              Bei Fehlern Anfragen durchlassen (für Hochverfügbarkeit)
            </span>
          </div>
        </div>
        <div>
          <Label>Log-Level</Label>
          <select
            value={cfg.logLevel}
            onChange={(e) => update({ logLevel: e.target.value as FirewallConfig['logLevel'] })}
            disabled={!isAdmin}
            className="w-full border rounded-md p-2 bg-background"
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </div>
      </Row>

      <Row>
        <div>
          <Label>Redaction Token</Label>
          <input
            type="text"
            value={cfg.redactionToken}
            onChange={(e) => update({ redactionToken: e.target.value })}
            disabled={!isAdmin}
            className="w-full border rounded-md p-2 bg-background"
          />
          {errors.redactionToken && (
            <div className="mt-1 text-xs text-red-600">{errors.redactionToken}</div>
          )}
        </div>
        <div>
          <Label>Retry Attempts</Label>
          <input
            type="number"
            min={0}
            max={10}
            value={cfg.retryAttempts}
            onChange={(e) => update({ retryAttempts: Number(e.target.value) })}
            disabled={!isAdmin}
            className="w-full border rounded-md p-2 bg-background"
          />
          {errors.retryAttempts && (
            <div className="mt-1 text-xs text-red-600">{errors.retryAttempts}</div>
          )}
        </div>
      </Row>

      <Row>
        <div>
          <Label>Circuit Breaker</Label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={cfg.circuitBreakerEnabled}
              onChange={(e) => update({ circuitBreakerEnabled: e.target.checked })}
              disabled={!isAdmin}
              className="h-4 w-4"
            />
            <span className="text-sm text-muted-foreground">
              Schutz vor Kaskadierungsfehlern aktivieren
            </span>
          </div>
        </div>
        <div>
          <Label>Cache</Label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={cfg.cacheEnabled}
              onChange={(e) => update({ cacheEnabled: e.target.checked })}
              disabled={!isAdmin}
              className="h-4 w-4"
            />
            <span className="text-sm text-muted-foreground">Antwort-Caching aktivieren</span>
          </div>
        </div>
      </Row>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !isAdmin || Object.keys(errors).length > 0}
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={() => reload()}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Neu laden
        </button>
        <a
          href={`/${locale}/dashboard/firewall`}
          className="ml-auto text-sm underline text-muted-foreground hover:text-foreground"
        >
          Zurück zur Firewall
        </a>
      </div>
    </form>
  );
}
