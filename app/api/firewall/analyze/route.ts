import { NextRequest, NextResponse } from 'next/server';
import {
  createSuperagentFirewall,
  defaultSuperagentConfig,
  type SuperagentFirewallConfig,
} from '@/lib/superagent-firewall';
import { getDb } from '@/database/db';
import { firewallLogs } from '@/database/schema/firewall';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface FirewallRequest {
  input: string;
  type: 'prompt' | 'query' | 'message';
  metadata?: {
    userId?: string;
    sessionId?: string;
    source?: string;
    model?: string;
  };
  mode?: 'enforce' | 'shadow' | 'off';
}

// Initialize firewall with environment configuration
const firewallConfig: SuperagentFirewallConfig = {
  enabled: process.env.FIREWALL_ENABLED === 'true' && !!process.env.SUPERAGENT_API_KEY,
  superagentUrl: process.env.SUPERAGENT_URL ?? 'http://localhost:3000',
  apiKey: process.env.SUPERAGENT_API_KEY ?? '',
  mode:
    (process.env.FIREWALL_MODE as 'enforce' | 'shadow' | 'off' | undefined) ??
    defaultSuperagentConfig.mode ??
    'enforce',
  timeout: defaultSuperagentConfig.timeout ?? 10000,
  retryAttempts: defaultSuperagentConfig.retryAttempts ?? 3,
  retryDelay: defaultSuperagentConfig.retryDelay ?? 1000,
  rules: defaultSuperagentConfig.rules ?? [],
};
const firewall = createSuperagentFirewall(firewallConfig);

export async function POST(request: NextRequest) {
  try {
    // Robust body parsing: try json(), then text() -> JSON.parse
    let raw: unknown = await request.json().catch(() => null);
    if (!raw) {
      const txt = await (request as any).text?.().catch(() => '');
      if (txt && typeof txt === 'string') {
        try {
          raw = JSON.parse(txt);
        } catch {
          /* ignore */
        }
      }
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const body = raw as Partial<FirewallRequest> & { content?: string };
    const input = body.input ?? body.content;
    const type = body.type ?? 'prompt';
    const metadata = body.metadata ?? {};
    const mode = body.mode ?? firewallConfig.mode;

    if (!input || !type) {
      return NextResponse.json({ error: 'Input and type are required' }, { status: 400 });
    }
    const requestId = uuidv4();
    const startTime = Date.now();

    // Create firewall input
    const firewallInput = {
      id: requestId,
      timestamp: new Date().toISOString(),
      content: input,
      type,
      metadata,
    };

    // Log the request (best-effort)
    const db = await getDb();
    try {
      await db.insert(firewallLogs).values({
        ts: new Date(),
        requestId,
        backend: 'superagent',
        policy: 'firewall-analysis',
        action: mode === 'off' ? 'allow' : 'analyze',
        latencyMs: 0, // Will be updated
        status: 200,
        meta: {
          inputType: type,
          mode,
          userId: (metadata as any)?.userId,
          source: (metadata as any)?.source,
          model: (metadata as any)?.model,
        },
      });
    } catch (e) {
      console.warn('Firewall pre-log failed, continuing:', e);
    }

    // Analyze with firewall
    const result = await firewall.analyzeInput(firewallInput);
    const derivedReasonCode =
      (result as any).reasonCode ?? (result.blocked ? 'POLICY_RULE_MATCH' : undefined);
    const explainability = Array.isArray(result.alerts)
      ? result.alerts.map((a) => ({
          code: derivedReasonCode || 'UNKNOWN',
          message: a.message,
          severity: a.severity,
          ruleId: (a.details as any)?.ruleId,
          evidence: (a.details as any) ?? {},
          stage: 'pre' as const,
        }))
      : [];
    const latencyMs = Date.now() - startTime;

    // Update log with results
    const action = result.blocked ? 'block' : 'allow';
    const shadowAction = mode === 'shadow' ? `shadow-${action}` : action;

    await db
      .update(firewallLogs)
      .set({
        action: shadowAction,
        latencyMs,
        status: result.blocked ? 403 : 200,
        meta: {
          ...firewallInput.metadata,
          blocked: result.blocked,
          reason: result.reason,
          reasonCode: derivedReasonCode,
          alerts: result.alerts,
          explainability,
          processingTime: result.processingTime,
        },
      })
      .where(eq(firewallLogs.requestId, requestId));

    if (result.blocked && mode === 'enforce') {
      return NextResponse.json(
        {
          blocked: true,
          reason: result.reason,
          reasonCode: derivedReasonCode,
          alerts: result.alerts,
          explainability,
          requestId,
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      content: result.content,
      blocked: result.blocked,
      reason: result.reason,
      reasonCode: derivedReasonCode,
      alerts: result.alerts,
      explainability,
      sanitized: result.sanitized,
      processingTime: result.processingTime,
      requestId,
    });
  } catch (error) {
    console.error('Firewall analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error during firewall analysis' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // In test mode, avoid external calls
    if (process.env.TEST_MODE === 'true') {
      return NextResponse.json({
        status: 'healthy',
        mode: firewallConfig.mode,
        enabled: firewallConfig.enabled,
        superagentUrl: firewallConfig.superagentUrl,
      });
    }
    const health = await firewall.healthCheck();

    return NextResponse.json({
      status: health ? 'healthy' : 'unhealthy',
      mode: firewallConfig.mode,
      enabled: firewallConfig.enabled,
      superagentUrl: firewallConfig.superagentUrl,
    });
  } catch (error) {
    console.error('Firewall health check error:', error);
    return NextResponse.json({ status: 'error', error: 'Health check failed' }, { status: 500 });
  }
}
