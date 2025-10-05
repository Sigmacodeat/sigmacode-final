/****
 * SIGMACODE Edge Policy Worker (Cloudflare Workers)
 * - Stores firewall policies in KV (POLICIES)
 * - Simple endpoints:
 *   - POST /edge/policy/sync   (body: PolicySyncRequest from OpenAPI)
 *   - GET  /edge/policy/{id}   (fetch a policy)
 *   - POST /edge/enforce       (example enforcement: returns allow/block/sanitize)
 *
 * Bindings (wrangler.toml):
 * - KV: POLICIES
 */

/// <reference types="@cloudflare/workers-types" />

export interface Guardrail {
  id: string;
  name: string;
  type: 'input_filter' | 'output_filter' | 'context_check' | 'format_validation';
  condition: string;
  action: 'block' | 'sanitize' | 'warn' | 'transform';
  priority?: number;
  enabled?: boolean;
  metadata?: Record<string, any>;
}

export interface Policy {
  id: string;
  name: string;
  version: string;
  mode: 'enforce' | 'shadow' | 'off';
  rules: Guardrail[];
  updatedAt?: string;
}

export interface PolicySyncRequest {
  target: string; // e.g. edge:cloudflare
  policy: Policy;
  dryRun?: boolean;
}

export interface Env {
  POLICIES: KVNamespace;
}

function json(data: any, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
    ...init,
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

async function applyPolicy(env: Env, p: Policy) {
  const id = p.id;
  const stored: Policy = { ...p, updatedAt: nowIso() };
  await env.POLICIES.put(`policy:${id}`, JSON.stringify(stored));
  await env.POLICIES.put(`policy:latest`, JSON.stringify(stored));
  return stored;
}

async function getPolicy(env: Env, id: string): Promise<Policy | null> {
  const raw = await env.POLICIES.get(`policy:${id}`);
  return raw ? (JSON.parse(raw) as Policy) : null;
}

function evaluateRules(
  input: string,
  policy: Policy,
): { decision: 'allow' | 'block' | 'sanitize'; appliedRules: string[] } {
  if (policy.mode === 'off') return { decision: 'allow', appliedRules: [] };
  const active = (policy.rules || []).filter((r) => r.enabled !== false);
  const applied: string[] = [];
  let decision: 'allow' | 'block' | 'sanitize' = 'allow';

  for (const r of active) {
    // Extremely simple evaluator: check substrings based on condition heuristic
    const cond = r.condition?.toLowerCase?.() || '';
    const txt = input.toLowerCase();
    const hits = cond.includes('contains(')
      ? (() => {
          const m = /contains\(prompt,\s*'([^']+)'\)/i.exec(r.condition);
          if (m?.[1]) return txt.includes(m[1].toLowerCase());
          return false;
        })()
      : cond
        ? txt.includes(cond)
        : false;

    if (hits) {
      applied.push(r.id);
      if (r.action === 'block') decision = 'block';
      if (r.action === 'sanitize' && decision !== 'block') decision = 'sanitize';
    }
  }
  return { decision, appliedRules: applied };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health
    if (path === '/edge/health') return new Response('ok');

    // Sync policy
    if (path === '/edge/policy/sync' && request.method === 'POST') {
      try {
        const body = (await request.json()) as PolicySyncRequest;
        if (!body?.policy?.id) return json({ error: 'Invalid policy' }, { status: 400 });
        if (body.dryRun) {
          return json({
            success: true,
            target: body.target || 'edge:cloudflare',
            appliedVersion: body.policy.version,
            diagnostics: ['dry-run'],
          });
        }
        const stored = await applyPolicy(env, body.policy);
        return json({
          success: true,
          target: body.target || 'edge:cloudflare',
          appliedVersion: stored.version,
        });
      } catch (e: any) {
        return json({ error: e?.message || 'sync failed' }, { status: 500 });
      }
    }

    // Get policy by id
    if (path.startsWith('/edge/policy/') && request.method === 'GET') {
      const id = path.split('/').pop()!;
      const p = await getPolicy(env, id);
      if (!p) return json({ error: 'not found' }, { status: 404 });
      return json({ policy: p });
    }

    // Example enforcement endpoint
    if (path === '/edge/enforce' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { input?: string; policyId?: string };
        const { input, policyId } = body;
        const policy = policyId ? await getPolicy(env, policyId) : await getPolicy(env, 'latest');
        if (!policy) return json({ error: 'No policy' }, { status: 404 });
        const { decision, appliedRules } = evaluateRules(String(input || ''), policy);
        return json({ decision, appliedRules, policy: policy.id });
      } catch (e: any) {
        return json({ error: e?.message || 'enforce failed' }, { status: 500 });
      }
    }

    return json({ error: 'Not found' }, { status: 404 });
  },
};
