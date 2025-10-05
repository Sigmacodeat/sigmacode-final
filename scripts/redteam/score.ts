#!/usr/bin/env tsx

/*
  SIGMACODE Red-Team Scorer (POC)
  Liest JSONL-Resultate aus dem Harness und erzeugt:
  - Console Summary (gesamt + pro Kategorie)
  - CSV-Export mit Metriken

  Usage:
  tsx scripts/redteam/score.ts --in .rt_results.jsonl --out .rt_scores.csv
*/

import fs from 'node:fs';
import readline from 'node:readline';

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
  if (!opts.in || !opts.out) {
    console.error('Usage: tsx score.ts --in <results.jsonl> --out <scores.csv>');
    process.exit(1);
  }
  return { inFile: String(opts.in), outFile: String(opts.out) };
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

function p50(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const i = Math.floor(0.5 * (s.length - 1));
  return s[i];
}

function p95(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.floor(0.95 * (s.length - 1));
  return s[idx];
}

async function main() {
  const { inFile, outFile } = parseArgs();
  const rows: ResultRow[] = [];
  for await (const r of readJsonl<ResultRow>(inFile)) {
    rows.push(r);
  }

  const byCat = new Map<string, ResultRow[]>();
  for (const r of rows) {
    const k = r.category || 'unknown';
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k)!.push(r);
  }

  function computeStats(list: ResultRow[]) {
    const total = list.length;
    const errors = list.filter((r) => r.error).length;
    const blocked = list.filter((r) => r.blocked === true).length;
    const allowed = total - blocked;
    const lat = list.map((r) => r.latencyMs || 0);
    const median = p50(lat);
    const pctl95 = p95(lat);
    return { total, errors, blocked, allowed, median, p95: pctl95 };
  }

  const overall = computeStats(rows);
  console.log('=== Overall ===');
  console.log(overall);

  const out = fs.createWriteStream(outFile, 'utf8');
  out.write('category,total,errors,blocked,allowed,latency_p50_ms,latency_p95_ms\n');
  for (const [cat, list] of byCat.entries()) {
    const s = computeStats(list);
    console.log(`-- ${cat}`, s);
    out.write(`${cat},${s.total},${s.errors},${s.blocked},${s.allowed},${s.median},${s.p95}\n`);
  }
  out.end();
  console.log(`CSV -> ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
