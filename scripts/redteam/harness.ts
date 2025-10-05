#!/usr/bin/env tsx

/*
  SIGMACODE Red-Team Harness (POC)
  - Liest JSONL Prompts ({id, prompt, basePrompt, category})
  - Führt Requests gegen eine Ziel-API aus (Agent-Invoke oder /validate)
  - Schreibt JSONL Resultate: { id, category, prompt, status, latencyMs, decision, blocked, responsePreview, error }

  Beispiele:
  tsx scripts/redteam/harness.ts \
    --prompts .rt_jailbreak.jsonl \
    --endpoint http://localhost:3000/api/agents/test-agent/invoke \
    --mode enforce \
    --concurrency 5 \
    --out .rt_results.jsonl
*/

import fs from 'node:fs';
import readline from 'node:readline';
import { setTimeout as delay } from 'node:timers/promises';

interface PromptRow {
  id: string;
  prompt: string;
  basePrompt?: string;
  category?: string;
}

interface ResultRow {
  id: string;
  category: string;
  prompt: string;
  status: number | null;
  latencyMs: number;
  decision?: string;
  blocked?: boolean;
  responsePreview?: string;
  error?: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = args[i + 1]?.startsWith('--') || args[i + 1] === undefined ? 'true' : args[++i];
      opts[k] = v;
    }
  }
  if (!opts.prompts || !opts.endpoint || !opts.out) {
    console.error(
      'Usage: tsx harness.ts --prompts <file.jsonl> --endpoint <url> --out <out.jsonl> [--mode enforce|shadow|off] [--concurrency 5]',
    );
    process.exit(1);
  }
  return {
    promptsFile: String(opts.prompts),
    endpoint: String(opts.endpoint),
    outFile: String(opts.out),
    mode: (opts.mode as 'enforce' | 'shadow' | 'off' | undefined) || 'enforce',
    concurrency: Number(opts.concurrency || 5),
    apiKey: opts.apiKey || process.env.FIREWALL_API_KEY,
  };
}

async function* readJsonl<T = any>(path: string): AsyncGenerator<T> {
  const rl = readline.createInterface({ input: fs.createReadStream(path, 'utf8') });
  for await (const line of rl) {
    const t = line.trim();
    if (!t) continue;
    try {
      yield JSON.parse(t);
    } catch {}
  }
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function postJSON(
  url: string,
  body: any,
  headers: Record<string, string>,
): Promise<{ status: number; text: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text };
}

function extractDecision(text: string): { decision?: string; blocked?: boolean } {
  try {
    const json = JSON.parse(text);
    const decision: string | undefined = json?.firewall?.decision || json?.decision;
    const blocked = decision === 'block' || json?.status === 451;
    return { decision, blocked };
  } catch {
    return {};
  }
}

async function runOne(
  endpoint: string,
  row: PromptRow,
  mode: 'enforce' | 'shadow' | 'off',
  apiKey?: string,
): Promise<ResultRow> {
  const started = Date.now();
  const xreq = randomId();
  const headers: Record<string, string> = {
    'x-request-id': xreq,
    'x-firewall-mode': mode,
  };
  if (apiKey) headers['x-api-key'] = apiKey;

  // Generisches Body-Modell: { input } für Agent-Invoke; optional fallback /validate
  const body = { input: row.prompt };
  try {
    const { status, text } = await postJSON(endpoint, body, headers);
    const latencyMs = Date.now() - started;
    const { decision, blocked } = extractDecision(text);
    return {
      id: row.id,
      category: row.category || 'unknown',
      prompt: row.prompt,
      status,
      latencyMs,
      decision,
      blocked,
      responsePreview: text.slice(0, 280),
    };
  } catch (e: any) {
    return {
      id: row.id,
      category: row.category || 'unknown',
      prompt: row.prompt,
      status: null,
      latencyMs: Date.now() - started,
      error: e?.message || String(e),
    };
  }
}

async function main() {
  const { promptsFile, endpoint, outFile, concurrency, mode, apiKey } = parseArgs();
  const out = fs.createWriteStream(outFile, 'utf8');
  const queue: Promise<void>[] = [];
  let active = 0;
  let processed = 0;

  async function enqueue(row: PromptRow) {
    while (active >= concurrency) await delay(25);
    active++;
    const p = runOne(endpoint, row, mode, apiKey)
      .then((r) => {
        out.write(JSON.stringify(r) + '\n');
      })
      .catch((e) => {
        out.write(JSON.stringify({ id: row.id, error: String(e) }) + '\n');
      })
      .finally(() => {
        active--;
        processed++;
        if (processed % 20 === 0) console.log(`processed=${processed}`);
      });
    queue.push(p);
  }

  for await (const row of readJsonl<PromptRow>(promptsFile)) {
    if (!row?.prompt) continue;
    await enqueue(row);
  }
  await Promise.allSettled(queue);
  out.end();
  console.log(`Results written -> ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
