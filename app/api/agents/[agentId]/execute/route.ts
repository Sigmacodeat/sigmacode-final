/**
 * SIGMACODE AI - Agent Execution API
 *
 * Dieser Endpunkt führt einen Agent/Workflow aus und integriert die Sigmaguard-Firewall.
 *
 * Flow:
 * 1. Firewall Pre-Check (falls aktiviert)
 * 2. Dify Workflow Execution
 * 3. Firewall Post-Check
 * 4. Audit Logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { agents, workflowExecutions } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { logger, logSecurityEvent, logPerformance } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface FirewallResult {
  allowed: boolean;
  blocked: boolean;
  reason?: string;
  score?: number;
  threats?: string[];
}

async function firewallPreCheck(
  input: any,
  requestId: string,
  mode: string,
): Promise<FirewallResult> {
  const firewallEnabled = process.env.FIREWALL_ENABLED === 'true';
  const firewallMode = process.env.FIREWALL_MODE || mode || 'off';

  if (!firewallEnabled || firewallMode === 'off') {
    return { allowed: true, blocked: false };
  }

  const superagentUrl = process.env.SUPERAGENT_URL || process.env.SIGMAGUARD_URL;
  if (!superagentUrl) {
    logger.warn('Firewall enabled but no SUPERAGENT_URL/SIGMAGUARD_URL configured');
    return { allowed: true, blocked: false };
  }

  try {
    const endPerf = logPerformance('firewall.pre_check');

    const response = await fetch(`${superagentUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        Authorization: `Bearer ${process.env.SUPERAGENT_API_KEY || process.env.SIGMAGUARD_API_KEY}`,
      },
      body: JSON.stringify({ input, type: 'pre_check' }),
    });

    const result = await response.json();
    endPerf({ status: result.allowed ? 'allowed' : 'blocked' });

    if (firewallMode === 'enforce' && result.blocked) {
      logSecurityEvent('firewall.input_blocked', {
        requestId,
        reason: result.reason,
        threats: result.threats,
      });
    }

    return result;
  } catch (error) {
    logger.error({ error, requestId }, 'Firewall pre-check failed');
    // Fail-open in case of firewall error (unless strict mode)
    return { allowed: true, blocked: false };
  }
}

async function executeDifyWorkflow(workflowId: string, input: any): Promise<any> {
  const difyApiUrl = process.env.DIFY_API_URL || 'http://localhost:5001';
  const difyApiKey = process.env.DIFY_API_KEY;

  if (!difyApiKey) {
    throw new Error('DIFY_API_KEY not configured');
  }

  const endPerf = logPerformance('dify.workflow_execution');

  try {
    const response = await fetch(`${difyApiUrl}/v1/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${difyApiKey}`,
      },
      body: JSON.stringify({
        inputs: input,
        response_mode: 'blocking',
        user: 'sigmacode-system',
      }),
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.statusText}`);
    }

    const result = await response.json();
    endPerf({ status: 'success' });

    return result;
  } catch (error) {
    endPerf({ status: 'error' });
    throw error;
  }
}

async function firewallPostCheck(
  output: any,
  requestId: string,
  mode: string,
): Promise<FirewallResult> {
  const firewallEnabled = process.env.FIREWALL_ENABLED === 'true';
  const firewallMode = process.env.FIREWALL_MODE || mode || 'off';

  if (!firewallEnabled || firewallMode === 'off') {
    return { allowed: true, blocked: false };
  }

  const superagentUrl = process.env.SUPERAGENT_URL || process.env.SIGMAGUARD_URL;
  if (!superagentUrl) {
    return { allowed: true, blocked: false };
  }

  try {
    const endPerf = logPerformance('firewall.post_check');

    const response = await fetch(`${superagentUrl}/analyze-output`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        Authorization: `Bearer ${process.env.SUPERAGENT_API_KEY || process.env.SIGMAGUARD_API_KEY}`,
      },
      body: JSON.stringify({ output, type: 'post_check' }),
    });

    const result = await response.json();
    endPerf({ status: result.allowed ? 'allowed' : 'blocked' });

    if (firewallMode === 'enforce' && result.blocked) {
      logSecurityEvent('firewall.output_blocked', {
        requestId,
        reason: result.reason,
        threats: result.threats,
      });
    }

    return result;
  } catch (error) {
    logger.error({ error, requestId }, 'Firewall post-check failed');
    return { allowed: true, blocked: false };
  }
}

export async function POST(req: NextRequest, { params }: { params: { agentId: string } }) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = Date.now();

  try {
    const { agentId } = params;
    const body = await req.json();
    const { input, workflowId } = body;

    logger.info({ agentId, workflowId, requestId }, 'Agent execution started');

    // 1. Load Agent Config
    const db = await getDb();
    const [agent] = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // 2. Firewall Pre-Check
    const firewallMode = agent.firewallEnabled ? agent.firewallPolicy : 'off';
    const preCheck = await firewallPreCheck(input, requestId, firewallMode);

    if (firewallMode === 'enforce' && preCheck.blocked) {
      // Create execution record for blocked request
      await db.insert(workflowExecutions).values({
        id: crypto.randomUUID(),
        workflowId: workflowId || agentId,
        input,
        output: null,
        status: 'failed',
        error: `Blocked by firewall: ${preCheck.reason}`,
        firewallPreCheck: preCheck as any,
        firewallPostCheck: null,
        startedAt: new Date(),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: 'Firewall blocked input',
            data: preCheck,
          },
        ],
      });

      return NextResponse.json(
        {
          error: 'Request blocked by firewall',
          reason: preCheck.reason,
          threats: preCheck.threats,
        },
        { status: 403 },
      );
    }

    // 3. Execute Workflow via Dify
    let workflowResult;
    try {
      workflowResult = await executeDifyWorkflow(workflowId || agentId, input);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await db.insert(workflowExecutions).values({
        id: crypto.randomUUID(),
        workflowId: workflowId || agentId,
        input,
        output: null,
        status: 'failed',
        error: errorMessage,
        firewallPreCheck: preCheck as any,
        firewallPostCheck: null,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: 'Workflow execution failed',
            data: { error: errorMessage },
          },
        ],
      });

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // 4. Firewall Post-Check
    const postCheck = await firewallPostCheck(workflowResult, requestId, firewallMode);

    if (firewallMode === 'enforce' && postCheck.blocked) {
      await db.insert(workflowExecutions).values({
        id: crypto.randomUUID(),
        workflowId: workflowId || agentId,
        input,
        output: workflowResult,
        status: 'failed',
        error: `Output blocked by firewall: ${postCheck.reason}`,
        firewallPreCheck: preCheck as any,
        firewallPostCheck: postCheck as any,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: 'Firewall blocked output',
            data: postCheck,
          },
        ],
      });

      return NextResponse.json(
        {
          error: 'Response blocked by firewall',
          reason: postCheck.reason,
          threats: postCheck.threats,
        },
        { status: 403 },
      );
    }

    // 5. Success: Save Execution Record
    const executionId = crypto.randomUUID();
    await db.insert(workflowExecutions).values({
      id: executionId,
      workflowId: workflowId || agentId,
      input,
      output: workflowResult,
      status: 'success',
      error: null,
      firewallPreCheck: preCheck as any,
      firewallPostCheck: postCheck as any,
      startedAt: new Date(startTime),
      completedAt: new Date(),
      duration: Date.now() - startTime,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Workflow executed successfully',
          data: {
            firewallPreCheck: preCheck,
            firewallPostCheck: postCheck,
          },
        },
      ],
    });

    logger.info(
      {
        agentId,
        workflowId,
        requestId,
        executionId,
        duration: Date.now() - startTime,
        firewallEnabled: firewallMode !== 'off',
      },
      'Agent execution completed',
    );

    return NextResponse.json({
      success: true,
      executionId,
      output: workflowResult,
      firewall: {
        enabled: firewallMode !== 'off',
        mode: firewallMode,
        preCheck,
        postCheck,
      },
    });
  } catch (error) {
    logger.error({ error, requestId }, 'Agent execution failed');

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
