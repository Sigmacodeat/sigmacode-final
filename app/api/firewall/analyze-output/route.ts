import { NextRequest, NextResponse } from 'next/server';
import {
  createSuperagentFirewall,
  defaultSuperagentConfig,
  type SuperagentFirewallConfig,
} from '@/lib/superagent-firewall';
import { getDb } from '@/database/db';
import { firewallLogs } from '@/database/schema/firewall';
import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/nextjs';

interface FirewallOutputRequest {
  input: string;
  output: string;
  metadata?: {
    userId?: string;
    sessionId?: string;
    source?: string;
    model?: string;
  };
  mode?: 'enforce' | 'shadow' | 'off';
}

// Initialize firewall with environment configuration (aligned with analyze route)
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
    // Parse sicher; bei Fehler null zurückgeben, nicht {} (vermeidet TS-Inferenz auf leeres Objekt)
    const raw: unknown = await request.json().catch(() => null);
    const body = raw as Partial<FirewallOutputRequest>;
    const input = body?.input;
    const output = body?.output;
    const metadata = body?.metadata;
    const mode = body?.mode || firewallConfig.mode;

    if (!input || !output) {
      return NextResponse.json(
        { error: 'Missing required fields: input, output' },
        { status: 400 },
      );
    }

    const requestId = request.headers.get('x-request-id') || randomUUID();
    const startTime = Date.now();

    // Firewall initialisieren
    const firewall = createSuperagentFirewall(firewallConfig);

    // Eingabeobjekt für die Firewall
    const firewallInput = {
      id: requestId,
      timestamp: new Date().toISOString(),
      content: input,
      type: 'message' as const,
      metadata: metadata ?? {},
    };

    // Ausgabeobjekt für die Firewall
    const firewallOutput = {
      id: `output_${requestId}`,
      timestamp: new Date().toISOString(),
      inputId: requestId,
      content: output,
      blocked: false,
      alerts: [] as any[],
      sanitized: false,
      processingTime: 0,
      metadata: {
        model: metadata?.model,
      },
    };

    // Analyse ausführen
    const result = await firewall.analyzeOutput(firewallInput, firewallOutput);
    const derivedReasonCode =
      (result as any).reasonCode ?? (result.blocked ? 'POLICY_RULE_MATCH' : undefined);
    const explainability = Array.isArray(result.alerts)
      ? result.alerts.map((a) => ({
          code: derivedReasonCode || 'UNKNOWN',
          message: a.message,
          severity: a.severity,
          ruleId: (a.details as any)?.ruleId,
          evidence: (a.details as any) ?? {},
          stage: 'post' as const,
        }))
      : [];
    const latencyMs = Date.now() - startTime;

    // Log in Datenbank schreiben
    const db = await getDb();
    await db.insert(firewallLogs).values({
      ts: new Date(),
      requestId,
      backend: 'superagent-output',
      policy: 'output-analysis',
      action: result.blocked ? 'block' : 'allow',
      latencyMs,
      status: result.blocked ? 403 : 200,
      meta: {
        inputLength: input.length,
        outputLength: output.length,
        model: metadata?.model,
        blocked: result.blocked,
        reason: result.reason,
        reasonCode: derivedReasonCode,
        alerts: result.alerts,
        explainability,
      },
    });

    if (result.blocked && mode === 'enforce') {
      {
        const res = NextResponse.json(
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
        res.headers.set('x-request-id', requestId);
        return res;
      }
    }

    {
      const res = NextResponse.json({
        blocked: result.blocked,
        reason: result.reason,
        reasonCode: derivedReasonCode,
        alerts: result.alerts,
        explainability,
        processingTime: latencyMs,
        requestId,
      });
      res.headers.set('x-request-id', requestId);
      return res;
    }
  } catch (error) {
    const requestId = request.headers.get('x-request-id') || 'unknown';
    Sentry.withScope((scope) => {
      scope.setTag('route', 'POST /api/firewall/analyze-output');
      scope.setTag('feature', 'firewall');
      scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
    console.error('Firewall output analysis error:', error);
    const res = NextResponse.json(
      { error: 'Internal server error during output analysis' },
      { status: 500 },
    );
    res.headers.set('x-request-id', requestId);
    return res;
  }
}
