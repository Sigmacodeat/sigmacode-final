'use client';

import { useState } from 'react';

export function Playground() {
  const [prompt, setPrompt] = useState(
    'Schreibe eine kurze Zusammenfassung über Firewall‑gesicherte AI‑Agenten.',
  );
  const [mode, setMode] = useState<'shadow' | 'enforce'>('shadow');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [policy, setPolicy] = useState<'allow' | 'block' | 'shadow-block' | ''>('');
  const [latency, setLatency] = useState<number | null>(null);

  async function run() {
    setLoading(true);
    setResult('');
    setPolicy('');
    setLatency(null);
    if (typeof window !== 'undefined' && (window as any).plausible) {
      try {
        (window as any).plausible('playground_run', { props: { mode } });
      } catch {}
    }
    const started = performance.now();
    try {
      const res = await fetch('/api/demo/echo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, mode }),
      });
      type Policy = '' | 'allow' | 'block' | 'shadow-block';
      const data = (await res.json()) as { output?: string; policy?: string };
      setResult(data?.output || '');
      const policyVal = (data?.policy ?? '') as Policy;
      setPolicy(policyVal);
      setLatency(Math.max(1, Math.round(performance.now() - started)));
      if (typeof window !== 'undefined' && (window as any).plausible) {
        try {
          (window as any).plausible('playground_result', {
            props: { mode, policy: (data?.policy ?? '') as Policy },
          });
          if (((data?.policy ?? '') as string).includes('block')) {
            (window as any).plausible('playground_block', { props: { mode } });
          }
        } catch {}
      }
    } catch (e) {
      setResult('Fehler beim Abruf. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Live‑Playground (Demo)</h2>
          <p className="mt-2 text-zinc-600">
            Teste Shadow/Enforce – die Firewall entscheidet, ob Inhalte erlaubt oder geblockt
            werden.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-700">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-2 h-40 w-full resize-y rounded-md border border-zinc-300 p-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-800"
          />
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm text-zinc-700">Modus</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="rounded-md border border-zinc-300 p-2 text-sm"
            >
              <option value="shadow">Shadow</option>
              <option value="enforce">Enforce</option>
            </select>
            <button
              onClick={run}
              disabled={loading}
              className="ml-auto rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading ? 'Läuft…' : 'Ausführen'}
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Hinweis: Diese Demo simuliert eine Antwort & Policies serverseitig.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">Antwort</div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              {latency !== null && <span>Latency: {latency} ms</span>}
              {policy && (
                <span
                  className={
                    policy.includes('block')
                      ? 'rounded bg-red-100 px-2 py-1 text-red-700'
                      : 'rounded bg-green-100 px-2 py-1 text-green-700'
                  }
                >
                  {policy}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 whitespace-pre-wrap text-zinc-800">{result || '–'}</div>
        </div>
      </div>
    </section>
  );
}
