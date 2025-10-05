'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export type FirewallEvent = {
  id: string;
  ts: string;
  actorType: string;
  actorId: string;
  resourceType: string | null;
  resourceId: string | null;
  phase?: 'pre' | 'post' | 'shadow' | 'shadow_error' | 'error';
  requestId?: string;
  backend?: 'sigmaguard';
  status?: number;
  ok?: boolean;
  latency?: number;
  firewall?: string | { enabled?: boolean; policy?: string; config?: any } | null;
  mode?: 'enforce' | 'shadow' | 'off';
  message?: string;
};

const phaseColors: Record<string, string> = {
  pre: 'bg-blue-500',
  post: 'bg-emerald-500',
  shadow: 'bg-indigo-500',
  shadow_error: 'bg-orange-500',
  error: 'bg-red-600',
};

function formatTs(ts: string) {
  try {
    const d = new Date(ts);
    return `${d.toLocaleTimeString()}\n${d.toLocaleDateString()}`;
  } catch {
    return ts;
  }
}

export function FirewallMonitor() {
  const [events, setEvents] = useState<FirewallEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sinceMinutes, setSinceMinutes] = useState(5);
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterBackend, setFilterBackend] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterPolicy, setFilterPolicy] = useState<string>('');
  const [maxRows, setMaxRows] = useState(500);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sourceRef = useRef<EventSource | null>(null);
  const atBottomRef = useRef<boolean>(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [agentId, setAgentId] = useState<string>(() => searchParams?.get('agentId') ?? '');

  const query = useMemo(() => {
    const since = new Date(Date.now() - sinceMinutes * 60_000).toISOString();
    const sp = new URLSearchParams();
    sp.set('since', since);
    if (agentId.trim()) sp.set('agentId', agentId.trim());
    return `?${sp.toString()}`;
  }, [sinceMinutes, agentId]);

  // Initiale Logs von der API laden, damit die Liste sofort gefüllt ist
  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      try {
        const sp = new URLSearchParams();
        sp.set('since', new Date(Date.now() - sinceMinutes * 60_000).toISOString());
        if (filterBackend !== 'all') sp.set('backend', filterBackend);
        if (filterAction !== 'all') sp.set('action', filterAction);
        if (filterPolicy.trim()) sp.set('policy', filterPolicy.trim());
        // optional: agentId als Search in requestId
        if (agentId.trim()) sp.set('q', agentId.trim());
        sp.set('limit', String(Math.min(maxRows, 200)));
        const res = await fetch(`/api/firewall/logs?${sp.toString()}`, {
          cache: 'no-store',
          headers: {
            'x-request-id':
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2),
          },
        });
        if (!res.ok) return;
        const json = (await res.json().catch(() => ({}))) as { data?: any[] };
        const rows = (json.data || []) as any[];
        // Map DB -> UI Event
        const mapped: FirewallEvent[] = rows.map((r) => ({
          id: String(r.id),
          ts: new Date(r.ts).toISOString(),
          actorType: 'user',
          actorId: r.userId ?? '',
          resourceType: 'agent',
          resourceId: r.meta?.agentId ?? null,
          phase: 'post',
          requestId: r.requestId,
          backend: r.backend,
          status: r.status,
          ok: typeof r.status === 'number' ? r.status < 400 : undefined,
          latency: r.latencyMs,
          firewall: r.policy ?? null,
          mode: undefined,
          message: undefined,
        }));
        if (!cancelled) setEvents(mapped);
      } catch {
        // ignore
      }
    }
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [sinceMinutes, filterBackend, filterAction, filterPolicy, agentId, maxRows]);

  useEffect(() => {
    if (paused) return;

    const src = new EventSource(`/api/firewall/events${query}`);
    sourceRef.current = src;

    src.onopen = () => setConnected(true);
    src.onerror = () => {
      setConnected(false);
      // Reconnect erfolgt automatisch durch erneute Ausführung des Effekts bei Query-/State-Änderungen
    };

    const onFirewall = (e: MessageEvent) => {
      try {
        const data: FirewallEvent = JSON.parse(e.data);
        setEvents((prev) => {
          const next = [...prev, data];
          if (next.length > maxRows) next.splice(0, next.length - maxRows);
          return next;
        });
      } catch {
        /* ignore */
      }
    };

    src.addEventListener('log', onFirewall as any);

    return () => {
      src.removeEventListener('log', onFirewall as any);
      src.close();
      setConnected(false);
    };
  }, [query, paused, maxRows]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [events]);

  const filtered = events.filter(
    (e) =>
      (filterPhase === 'all' || e.phase === filterPhase) &&
      (filterBackend === 'all' || e.backend === (filterBackend as any)),
  );

  const metrics = useMemo(() => {
    const last = filtered.slice(-100);
    const total = last.length;
    const errors = last.filter(
      (e) => e.phase === 'error' || e.phase === 'shadow_error' || e.ok === false,
    ).length;
    const avgLatency = (() => {
      const vals = last.map((e) => e.latency).filter((v): v is number => typeof v === 'number');
      if (!vals.length) return 0;
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    })();
    return { total, errors, avgLatency };
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-400'}`}
        />
        <span className="text-sm">{connected ? 'Verbunden' : 'Getrennt'}</span>
        <button
          className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Fortsetzen' : 'Pausieren'}
        </button>
        <label className="text-sm flex items-center gap-2">
          Agent ID:
          <input
            type="text"
            placeholder="optional"
            className="w-48 px-2 py-1 rounded border bg-transparent"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            onBlur={() => {
              const sp = searchParams
                ? new URLSearchParams(Array.from(searchParams.entries()))
                : new URLSearchParams();
              if (agentId.trim()) sp.set('agentId', agentId.trim());
              else sp.delete('agentId');
              router.replace(`?${sp.toString()}`);
            }}
          />
        </label>
        <label className="text-sm flex items-center gap-2">
          Seit (Min):
          <input
            type="number"
            className="w-20 px-2 py-1 rounded border bg-transparent"
            value={sinceMinutes}
            min={1}
            max={120}
            onChange={(e) =>
              setSinceMinutes(Math.max(1, Math.min(120, Number(e.target.value) || 1)))
            }
          />
        </label>
        <label className="text-sm flex items-center gap-2">
          Max Rows:
          <input
            type="number"
            className="w-24 px-2 py-1 rounded border bg-transparent"
            value={maxRows}
            min={100}
            max={5000}
            onChange={(e) =>
              setMaxRows(Math.max(100, Math.min(5000, Number(e.target.value) || 100)))
            }
          />
        </label>
        <label className="text-sm flex items-center gap-2">
          Phase:
          <select
            className="px-2 py-1 rounded border bg-transparent"
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
          >
            <option value="all">Alle</option>
            <option value="pre">pre</option>
            <option value="post">post</option>
            <option value="shadow">shadow</option>
            <option value="shadow_error">shadow_error</option>
            <option value="error">error</option>
          </select>
        </label>
        <label className="text-sm flex items-center gap-2">
          Backend:
          <select
            className="px-2 py-1 rounded border bg-transparent"
            value={filterBackend}
            onChange={(e) => setFilterBackend(e.target.value)}
          >
            <option value="all">Alle</option>
            <option value="sigmaguard">sigmaguard</option>
          </select>
        </label>
        <label className="text-sm flex items-center gap-2">
          Action:
          <select
            className="px-2 py-1 rounded border bg-transparent"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="all">Alle</option>
            <option value="allow">allow</option>
            <option value="block">block</option>
            <option value="sanitize">sanitize</option>
            <option value="shadow-allow">shadow-allow</option>
            <option value="shadow-block">shadow-block</option>
          </select>
        </label>
        <label className="text-sm flex items-center gap-2">
          Policy:
          <input
            type="text"
            placeholder="optional"
            className="w-40 px-2 py-1 rounded border bg-transparent"
            value={filterPolicy}
            onChange={(e) => setFilterPolicy(e.target.value)}
          />
        </label>
        {/* CSV Export */}
        <a
          className="ml-2 px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
          href={(() => {
            const sp = new URLSearchParams();
            sp.set('since', new Date(Date.now() - sinceMinutes * 60_000).toISOString());
            if (filterBackend !== 'all') sp.set('backend', filterBackend);
            if (filterAction !== 'all') sp.set('action', filterAction);
            if (filterPolicy.trim()) sp.set('policy', filterPolicy.trim());
            if (agentId.trim()) sp.set('q', agentId.trim());
            sp.set('limit', String(Math.min(maxRows, 500)));
            sp.set('format', 'csv');
            return `/api/firewall/logs?${sp.toString()}`;
          })()}
          download
        >
          CSV Export
        </a>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <div>
            Events (letzte 100): <b>{metrics.total}</b>
          </div>
          <div>
            Errors: <b className={metrics.errors ? 'text-red-600' : ''}>{metrics.errors}</b>
          </div>
          <div>
            Ø Latency: <b>{metrics.avgLatency} ms</b>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[60vh] overflow-auto rounded-lg border bg-white dark:bg-neutral-900"
        onScroll={(e) => {
          const el = e.currentTarget;
          const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 16;
          atBottomRef.current = nearBottom;
        }}
      >
        <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
          {filtered.map((e) => (
            <li key={e.id} className="p-3 flex gap-3 items-start">
              <span
                className={`mt-1 inline-flex h-3 w-3 rounded-full ${phaseColors[e.phase ?? 'error'] ?? 'bg-gray-400'}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800">
                    {e.phase}
                  </code>
                  {e.backend && (
                    <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800">
                      {e.backend}
                    </code>
                  )}
                  {typeof e.status === 'number' && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${e.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                    >
                      HTTP {e.status}
                    </span>
                  )}
                  {typeof e.latency === 'number' && (
                    <span className="text-xs text-gray-600">{e.latency} ms</span>
                  )}
                  {e.mode && <span className="text-xs text-gray-600">mode: {e.mode}</span>}
                  {e.firewall && typeof e.firewall === 'string' && (
                    <span className="text-xs text-gray-600">policy: {e.firewall}</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-600 break-all">
                  <span>
                    req: {e.requestId} · user: {e.actorId} · agent: {e.resourceId}
                  </span>
                  {e.message && <span className="ml-2 text-red-600">{e.message}</span>}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 whitespace-pre text-right">
                {formatTs(e.ts)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FirewallMonitor;
