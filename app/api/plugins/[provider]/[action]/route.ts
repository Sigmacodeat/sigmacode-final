import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { routePluginRequest } from '@/app/lib/plugins';
import { getFeatureFlags } from '@/app/lib/plugins/featureFlags';
import { PluginRequest } from '@/app/lib/plugins/types';

export const runtime = 'nodejs';

function json(status: number, data: unknown) {
  return NextResponse.json(data, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string; action: string } },
) {
  const { provider, action } = params;
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const startedAt = Date.now();

  const flags = getFeatureFlags();
  if (!flags.DIFY_PLUGIN_PROXY) {
    return json(403, { error: 'Plugin proxy disabled', requestId });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON body', requestId });
  }

  const pluginReq: PluginRequest = {
    provider,
    action,
    body,
    headers: Object.fromEntries(req.headers.entries()),
    requestId,
    tenantId: req.headers.get('x-tenant-id') || null,
    locale: req.headers.get('x-locale') || undefined,
    firewallMode: flags.FIREWALL_MODE,
  };

  // Pre-firewall hook (shadow/enforce handled down the line if needed)
  // For now we only attach requestId and log audit; real policy checks can be added later
  const audit = {
    requestId,
    provider,
    action,
    tenantId: pluginReq.tenantId,
    mode: flags.FIREWALL_MODE,
  };
  console.info('[plugin-proxy] request', audit);

  try {
    const result = await routePluginRequest(pluginReq);
    const latencyMs = Date.now() - startedAt;
    console.info('[plugin-proxy] response', { requestId, latencyMs, ok: true });
    return json(200, { requestId, latencyMs, result });
  } catch (err: any) {
    const latencyMs = Date.now() - startedAt;
    console.warn('[plugin-proxy] error', { requestId, latencyMs, error: err?.message });
    const status = err?.statusCode || 500;
    return json(status, { requestId, error: err?.message || 'Plugin request failed' });
  }
}
