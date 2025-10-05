import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth, type AuthenticatedRequest } from '@/lib/api-key-middleware';
import { getDb } from '@/database/db';
import { firewallLogs } from '@/database/schema/firewall';
import { and, eq } from 'drizzle-orm';
import { getEffectiveEntitlements, getStringEntitlement } from '@/lib/entitlements';

function maskMeta(meta: any) {
  if (!meta || typeof meta !== 'object') return meta;
  const clone = { ...meta };
  // Best-effort: mask potentielle sensible Felder in basic-Mode
  if (clone.prompt) clone.prompt = '[REDACTED]';
  if (clone.input) clone.input = '[REDACTED]';
  if (clone.output) clone.output = '[REDACTED]';
  if (clone.raw) clone.raw = '[REDACTED]';
  return clone;
}

export async function GET(request: NextRequest) {
  return withApiKeyAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const requestId = searchParams.get('requestId');
      if (!requestId) {
        return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
      }

      // Nur Logs des aktuellen Benutzers
      const db = await getDb();
      const logArr = await db
        .select()
        .from(firewallLogs)
        .where(and(eq(firewallLogs.requestId, requestId), eq(firewallLogs.userId, req.userId!)))
        .limit(1);
      const log = logArr[0];

      if (!log) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      // Entitlements laden
      const ents = await getEffectiveEntitlements(req.userId!);
      const explainLevel = getStringEntitlement(ents, 'explainability.level', 'basic');
      const advanced = explainLevel === 'advanced';

      const body = {
        requestId: log.requestId,
        ts: log.ts,
        backend: log.backend,
        policy: log.policy,
        action: log.action,
        latencyMs: log.latencyMs,
        status: log.status,
        // meta je nach Entitlement
        meta: advanced ? log.meta : maskMeta(log.meta),
      };

      return NextResponse.json({ success: true, explanation: body });
    } catch (err) {
      console.error('Explainability GET error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withApiKeyAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const rawBody: unknown = await request.json();
      if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
        return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
      }
      const body = rawBody as {
        requestId?: string;
        threatType?: string;
        explanation?: string;
        confidence?: number;
        riskFactors?: unknown[];
        mitigationSteps?: unknown[];
        similarIncidents?: unknown[];
      };

      // Validate required fields
      if (!body.requestId || !body.threatType || !body.explanation) {
        return NextResponse.json(
          { error: 'Missing required fields: requestId, threatType, explanation' },
          { status: 400 },
        );
      }

      // Validate threat type
      const validThreatTypes = [
        'prompt_injection',
        'secret_leakage',
        'sql_injection',
        'xss',
        'malicious_code',
      ];
      if (!validThreatTypes.includes(body.threatType)) {
        return NextResponse.json({ error: 'Invalid threat type' }, { status: 400 });
      }

      // Validate confidence range
      if (body.confidence !== undefined && (body.confidence < 0 || body.confidence > 1)) {
        return NextResponse.json({ error: 'Confidence must be between 0 and 1' }, { status: 400 });
      }

      // Validate explanation length
      if (body.explanation && body.explanation.length > 2000) {
        return NextResponse.json(
          { error: 'Explanation too long (max 2000 characters)' },
          { status: 400 },
        );
      }

      // Validate arrays
      if (body.riskFactors && !Array.isArray(body.riskFactors)) {
        return NextResponse.json({ error: 'riskFactors must be an array' }, { status: 400 });
      }

      if (body.mitigationSteps && !Array.isArray(body.mitigationSteps)) {
        return NextResponse.json({ error: 'mitigationSteps must be an array' }, { status: 400 });
      }

      if (body.similarIncidents && !Array.isArray(body.similarIncidents)) {
        return NextResponse.json({ error: 'similarIncidents must be an array' }, { status: 400 });
      }

      // Check if user has admin role
      if (req.userRole !== 'admin') {
        return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
      }

      // TODO: Insert into database
      const explanationId = crypto.randomUUID();

      return NextResponse.json(
        {
          success: true,
          explanationId,
          message: 'Threat explanation created successfully',
        },
        { status: 201 },
      );
    } catch (err) {
      console.error('Explainability POST error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
