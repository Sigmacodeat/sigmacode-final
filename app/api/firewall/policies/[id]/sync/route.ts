import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { policySchema } from '@/app/lib/validation/firewall-policy';
import { FirewallPolicy } from '@/database/schema/firewall_policies';
import { getToken } from 'next-auth/jwt';

interface PolicyResponse {
  policy: FirewallPolicy;
}

interface EdgeSyncResult {
  message?: string;
  error?: string;
  appliedVersion?: string | number | Date | null;
  target?: string;
  [key: string]: any;
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization') || undefined;
  // First try bearer auth header
  let user = await verifyJwt(authHeader);
  // Fallback: try cookie-based next-auth session
  if (!user) {
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        user = (token as any) ?? null;
      }
    } catch {
      // ignore
    }
  }

  if (!user) return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 });

  const id = context?.params?.id;
  if (!id)
    return NextResponse.json({ status: 'error', error: 'Policy ID required' }, { status: 400 });

  try {
    const { origin } = new URL(req.url);
    const REQUEST_TIMEOUT_MS = parseInt(process.env.EDGE_SYNC_TIMEOUT_MS || '10000', 10);

    // Fetch policy from our API (use origin from request)
    const policyAbort = new AbortController();
    const policyTimeout = setTimeout(() => policyAbort.abort(), REQUEST_TIMEOUT_MS);
    const policyRes = await fetch(`${origin}/api/firewall/policies/${id}`, {
      cache: 'no-store',
      signal: policyAbort.signal,
    }).finally(() => clearTimeout(policyTimeout));
    if (!policyRes.ok) throw new Error(`Policy fetch failed: ${policyRes.status}`);
    const policyData = (await policyRes.json()) as PolicyResponse;
    const policy = policyData.policy;

    // Validate policy before syncing to edge
    const parsed = policySchema.safeParse(policy);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Validation failed',
          issues: parsed.error.issues,
        },
        { status: 422 },
      );
    }

    // Sync to edge
    const edgeUrl = process.env.EDGE_BASE_URL || 'http://localhost:8787';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // Forward request id if available
    const reqId = req.headers.get('x-request-id');
    if (reqId) headers['x-request-id'] = reqId;
    if (process.env.EDGE_API_KEY) headers['x-api-key'] = process.env.EDGE_API_KEY;

    const edgeAbort = new AbortController();
    const edgeTimeout = setTimeout(() => edgeAbort.abort(), REQUEST_TIMEOUT_MS);
    const syncRes = await fetch(`${edgeUrl}/edge/policy/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        target: 'edge:cloudflare',
        policy,
        dryRun: false,
      }),
      signal: edgeAbort.signal,
    }).finally(() => clearTimeout(edgeTimeout));

    const syncResult = (await syncRes.json().catch(() => ({}))) as EdgeSyncResult;
    if (!syncRes.ok) throw new Error(syncResult?.message || 'Edge sync failed');

    const appliedVersion =
      syncResult.appliedVersion ?? (policy as any)?.version ?? (policy as any)?.updatedAt ?? null;
    return NextResponse.json({
      status: 'ok',
      message: 'Edge sync successful',
      appliedVersion,
      target: syncResult?.target ?? 'edge:cloudflare',
    });
  } catch (e: any) {
    return NextResponse.json({ status: 'error', error: e.message }, { status: 500 });
  }
}
