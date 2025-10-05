'use client';

import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Plus, RefreshCcw, Trash2, Check, X, CheckSquare, Square } from 'lucide-react';

type Policy = {
  id: string;
  name: string;
  mode: 'enforce' | 'shadow' | string;
  isActive: boolean;
  priority: number;
};

type Binding = {
  id: string;
  tenantId: string;
  policyId: string;
  routePrefix: string | null;
  isActive: boolean;
  createdAt?: string;
};

export default function RouteBindingsManager() {
  const [selectedBindings, setSelectedBindings] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [tenantId, setTenantIdState] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef<boolean>(true);

  type PoliciesResponse = { policies?: Policy[]; message?: string };
  type BindingsResponse = { bindings?: Binding[]; message?: string };

  async function fetchWithRetry(
    url: string,
    init: RequestInit & { signal?: AbortSignal },
    retries = 1,
    backoffMs = 300,
  ) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ''}`);
      }
      return res;
    } catch (err) {
      if (retries > 0 && !(err instanceof DOMException && err.name === 'AbortError')) {
        await new Promise((r) => setTimeout(r, backoffMs));
        return fetchWithRetry(url, init, retries - 1, backoffMs * 2);
      }
      throw err as Error;
    }
  }

  const debounceTimeout = useRef<number | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    setStatusMsg(null);

    // Bereits laufende Requests abbrechen
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const tenantQuery = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
      const [pRes, bRes] = await Promise.all([
        fetchWithRetry(`/api/firewall/policies${tenantQuery}`, {
          method: 'GET',
          signal: controller.signal,
        }),
        fetchWithRetry(`/api/firewall/bindings${tenantQuery}`, {
          method: 'GET',
          signal: controller.signal,
        }),
      ]);

      const pJson = (await pRes.json()) as PoliciesResponse;
      const bJson = (await bRes.json()) as BindingsResponse;
      const nextPolicies = pJson.policies ?? [];
      const nextBindings = bJson.bindings ?? [];

      setPolicies(nextPolicies);
      setBindings(nextBindings);
    } catch (e: any) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return; // bewusst abgebrochen
      }
      setError(e?.message || 'Daten konnten nicht geladen werden.');
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  }

  // Initial laden und Cleanup
  useEffect(() => {
    mountedRef.current = true;
    loadAll();
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
      if (debounceTimeout.current) window.clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce passiert direkt in setTenantId

  async function toggleBinding(bindingId: string, currentActive: boolean) {
    setError(null);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/firewall/bindings?id=${bindingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatusMsg(`Binding ${!currentActive ? 'aktiviert' : 'deaktiviert'}.`);
      await loadAll();
    } catch (e) {
      setError('Binding konnte nicht geändert werden.');
    }
  }

  async function deleteBinding(bindingId: string) {
    if (!confirm('Binding wirklich löschen?')) return;
    setError(null);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/firewall/bindings?id=${bindingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatusMsg('Binding gelöscht.');
      await loadAll();
    } catch (e) {
      setError('Binding konnte nicht gelöscht werden.');
    }
  }

  // Bulk actions
  async function bulkToggleActive(targetActive: boolean) {
    if (selectedBindings.size === 0) return;
    setLoading(true);
    setError(null);
    setStatusMsg(null);
    try {
      const ids = Array.from(selectedBindings);
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/firewall/bindings?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: targetActive }),
          }),
        ),
      );
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        setError(`${failures.length} von ${ids.length} Aktionen fehlgeschlagen.`);
      } else {
        setStatusMsg(`Alle ${ids.length} Bindings ${targetActive ? 'aktiviert' : 'deaktiviert'}.`);
      }
      await loadAll();
    } catch (e) {
      setError('Bulk-Aktion fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  async function bulkDeleteSelected() {
    if (selectedBindings.size === 0) return;
    if (!confirm(`Wirklich ${selectedBindings.size} Bindings löschen?`)) return;
    setLoading(true);
    setError(null);
    setStatusMsg(null);
    try {
      const ids = Array.from(selectedBindings);
      const results = await Promise.allSettled(
        ids.map((id) => fetch(`/api/firewall/bindings?id=${id}`, { method: 'DELETE' })),
      );
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        setError(`${failures.length} von ${ids.length} Löschvorgängen fehlgeschlagen.`);
      } else {
        setStatusMsg(`${ids.length} Bindings gelöscht.`);
      }
      setSelectedBindings(new Set());
      setIsAllSelected(false);
      await loadAll();
    } catch (e) {
      setError('Bulk-Löschung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  async function createBinding(formData: FormData) {
    setError(null);
    setStatusMsg(null);
    try {
      const rawTenantId = String(formData.get('tenantId') || '').trim();
      const rawPolicyId = String(formData.get('policyId') || '').trim();
      let rawRoutePrefix = String(formData.get('routePrefix') || '').trim();
      if (rawRoutePrefix && !rawRoutePrefix.startsWith('/')) rawRoutePrefix = `/${rawRoutePrefix}`;

      const body = {
        tenantId: rawTenantId,
        policyId: rawPolicyId,
        routePrefix: rawRoutePrefix,
        isActive: true,
      };
      if (!body.tenantId || !body.policyId || !body.routePrefix) {
        setError('Bitte Tenant, Policy und Route angeben.');
        return;
      }
      // Optional: Policy-Existenz prüfen
      const policyExists = policies.some((p) => p.id === body.policyId);
      if (!policyExists) {
        setError('Ausgewählte Policy ist ungültig.');
        return;
      }
      const res = await fetch('/api/firewall/bindings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatusMsg('Binding erstellt.');
      await loadAll();
    } catch (e) {
      setError('Binding konnte nicht erstellt werden.');
    }
  }

  function setTenantId(value: string): void {
    setTenantIdState(value);
    if (debounceTimeout.current) window.clearTimeout(debounceTimeout.current);
    debounceTimeout.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      loadAll();
    }, 400);
  }

  return (
    <section className="space-y-4" aria-labelledby="bindings-heading">
      <h2 id="bindings-heading" className="text-lg font-semibold">
        Route-Bindings
      </h2>

      {/* Hinweis-Section entfernt (nicht notwendig für Funktionalität) */}

      <div className="sr-only" role="status" aria-live="polite">
        {statusMsg || ''}
      </div>
      {statusMsg && (
        <div className="text-sm text-emerald-600" role="status">
          {statusMsg}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Filter / Tenant */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Tenant ID (optional)</label>
          <input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="tenant_123"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          aria-busy={loading}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-accent disabled:opacity-50"
        >
          <RefreshCcw className="h-4 w-4" /> Aktualisieren
        </button>
      </div>

      {/* Create Binding */}
      <form
        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border rounded-md p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          if (!loading) createBinding(fd);
        }}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Tenant ID</label>
          <input
            name="tenantId"
            defaultValue={tenantId}
            className="w-full rounded-md border px-3 py-2"
            placeholder="tenant_123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Policy</label>
          <select
            name="policyId"
            className="w-full rounded-md border px-3 py-2"
            disabled={loading || policies.length === 0}
          >
            <option value="">– auswählen –</option>
            {policies.length === 0 && (
              <option value="" disabled>
                Keine Policies gefunden
              </option>
            )}
            {policies.map((p: Policy) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Route-Prefix</label>
          <input
            name="routePrefix"
            className="w-full rounded-md border px-3 py-2"
            placeholder="/api/dify"
            disabled={loading}
          />
        </div>
        <div className="flex">
          <button
            type="submit"
            disabled={loading}
            className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Binding hinzufügen
          </button>
        </div>
      </form>

      {/* List */}
      <div className="border rounded-md overflow-hidden">
        {/* Bulk toolbar */}
        <div className="flex items-center justify-between gap-3 p-2 border-b bg-background/60">
          <div className="text-sm text-muted-foreground">
            {selectedBindings.size > 0
              ? `${selectedBindings.size} ausgewählt`
              : `${bindings.length} Einträge`}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={selectedBindings.size === 0 || loading}
              onClick={() => bulkToggleActive(true)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 hover:bg-accent disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Aktivieren
            </button>
            <button
              disabled={selectedBindings.size === 0 || loading}
              onClick={() => bulkToggleActive(false)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 hover:bg-accent disabled:opacity-50"
            >
              <X className="h-4 w-4" /> Deaktivieren
            </button>
            <button
              disabled={selectedBindings.size === 0 || loading}
              onClick={bulkDeleteSelected}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 hover:bg-accent text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Löschen
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 w-10">
                <button
                  aria-label={isAllSelected ? 'Alle abwählen' : 'Alle auswählen'}
                  className="inline-flex items-center justify-center rounded border px-2 py-1 hover:bg-accent"
                  onClick={() => {
                    if (isAllSelected) {
                      setSelectedBindings(new Set());
                      setIsAllSelected(false);
                    } else {
                      setSelectedBindings(new Set(bindings.map((b: Binding) => String(b.id))));
                      setIsAllSelected(true);
                    }
                  }}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="text-left p-2">Route</th>
              <th className="text-left p-2">Policy</th>
              <th className="text-left p-2">Tenant</th>
              <th className="text-left p-2">Aktiv</th>
              <th className="text-left p-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {bindings.map((b: Binding) => {
              const isSelected = selectedBindings.has(String(b.id));
              return (
                <tr key={b.id} className="border-t">
                  <td className="p-2 w-10">
                    <button
                      aria-label={isSelected ? 'Auswahl entfernen' : 'Auswählen'}
                      className="inline-flex items-center justify-center rounded border px-2 py-1 hover:bg-accent"
                      onClick={() => {
                        setSelectedBindings((prev) => {
                          const n = new Set(prev);
                          if (n.has(String(b.id))) n.delete(String(b.id));
                          else n.add(String(b.id));
                          setIsAllSelected(n.size === bindings.length && bindings.length > 0);
                          return n;
                        });
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-2 font-mono">{b.routePrefix}</td>
                  <td className="p-2">
                    {policies.find((p: Policy) => p.id === b.policyId)?.name || b.policyId}
                  </td>
                  <td className="p-2">{b.tenantId}</td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleBinding(String(b.id), Boolean(b.isActive))}
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 border ${b.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'} hover:opacity-90`}
                    >
                      {b.isActive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      <span>{b.isActive ? 'Aktiv' : 'Inaktiv'}</span>
                    </button>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBinding(String(b.id), Boolean(b.isActive))}
                        className="inline-flex items-center gap-1 rounded border px-2 py-1 hover:bg-accent"
                        aria-label={b.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        {b.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        <span className="hidden sm:inline">
                          {b.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        </span>
                      </button>
                      <button
                        onClick={() => deleteBinding(String(b.id))}
                        className="inline-flex items-center gap-1 rounded border px-2 py-1 hover:bg-accent text-red-600"
                        aria-label="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Löschen</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {bindings.length === 0 && (
              <tr className="border-t">
                <td className="p-3 text-muted-foreground" colSpan={6}>
                  Keine Bindings vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
