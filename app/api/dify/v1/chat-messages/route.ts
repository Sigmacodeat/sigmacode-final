/**
 * SIGMACODE AI - Dify Chat Proxy
 * Mit Firewall + Token-System
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { getFirewall } from '@/app/lib/middleware/firewall';
import { withTokenCheck } from '@/app/lib/services/token-service';
import { logger } from '@/lib/logger';

const DIFY_API_URL = process.env.DIFY_API_URL || 'http://localhost:5001';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { query, conversation_id, inputs } = body;

    // Token-Check + Firewall + Proxy
    const result = await withTokenCheck(session.user.id, 'chat_message', async () => {
      // Firewall Pre-Check (nur wenn für diese Route aktiv)
      const firewall = getFirewall();
      const routePath = '/api/dify/v1/chat-messages';
      const applyFw = await firewall.shouldApply(routePath);
      if (applyFw) {
        const preCheck = await firewall.checkInput(query, session.user.id);
        if (!preCheck.allowed) {
          logger.warn(
            { userId: session.user.id, threats: preCheck.threats },
            'Firewall blocked chat input',
          );
          throw new Error(`Blocked by firewall: ${preCheck.threats.join(', ')}`);
        }
      }

      // Proxy to Dify
      const difyResponse = await fetch(`${DIFY_API_URL}/v1/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DIFY_API_KEY || ''}`,
        },
        body: JSON.stringify({
          ...body,
          user: session.user.id, // Use our user ID
        }),
      });

      if (!difyResponse.ok) {
        const error = await difyResponse.text();
        throw new Error(`Dify API error: ${error}`);
      }

      // Handle streaming response
      if (body.response_mode === 'streaming') {
        // Return stream directly (firewall check on complete message later)
        return new Response(difyResponse.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }

      // Non-streaming: Get full response
      const difyData = await difyResponse.json();

      // Firewall Post-Check (nur wenn aktiv)
      if (applyFw && difyData.answer) {
        const postCheck = await firewall.checkOutput(difyData.answer, session.user.id);
        if (!postCheck.allowed) {
          logger.warn(
            { userId: session.user.id, threats: postCheck.threats },
            'Firewall blocked chat output',
          );
          throw new Error(`Response blocked by firewall: ${postCheck.threats.join(', ')}`);
        }
      }

      return difyData;
    });

    // If it's a stream, return it directly
    if (result instanceof Response) {
      return result;
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error({ error }, 'Chat messages proxy error');

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
