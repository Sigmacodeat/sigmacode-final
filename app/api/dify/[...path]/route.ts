/**
 * SIGMACODE AI - Dify API Proxy
 *
 * Proxy-Route zu Dify-Backend (Layer 3)
 * Leitet alle Requests zu http://localhost:5001 weiter
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getFirewall } from '@/app/lib/middleware/firewall';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIFY_API_URL = process.env.DIFY_API_URL || 'http://localhost:5001';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToDify(req, params.path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToDify(req, params.path, 'POST');
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToDify(req, params.path, 'PUT');
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToDify(req, params.path, 'PATCH');
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToDify(req, params.path, 'DELETE');
}

async function proxyToDify(req: NextRequest, pathSegments: string[], method: string) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  try {
    // Auth-Check (optional, je nach Dify-Route)
    const session = await getServerAuthSession();

    // Build Dify URL & Route-Path
    const difyPath = pathSegments.join('/');
    const difyUrl = `${DIFY_API_URL}/${difyPath}`;
    const routePath = `/api/dify/${difyPath}`;

    // Get request body if present
    let body;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await req.json();
      } catch {
        body = undefined;
      }
    }

    // Firewall Pre-Check (nur falls für diese Route aktiv und wenn prüfbarer Text vorhanden)
    const firewall = getFirewall();
    const applyFw = await firewall.shouldApply(routePath);
    if (applyFw && body) {
      try {
        let candidate: string | null = null;
        if (typeof body === 'string') candidate = body;
        else if (typeof body.query === 'string') candidate = body.query;
        else if (typeof body.input === 'string') candidate = body.input;
        else if (typeof body.prompt === 'string') candidate = body.prompt;
        else if (Array.isArray(body.messages)) {
          const last = body.messages[body.messages.length - 1];
          if (last && typeof last.content === 'string') candidate = last.content;
        }
        if (candidate) {
          const pre = await firewall.checkInput(candidate, session?.user?.id);
          if (!pre.allowed) {
            logger.warn({ requestId, threats: pre.threats }, 'Firewall blocked request input');
            return NextResponse.json(
              { error: 'Blocked by firewall', threats: pre.threats },
              { status: 400 },
            );
          }
        }
      } catch (e) {
        logger.error({ e }, 'Firewall pre-check failed');
      }
    }

    // Forward headers (filter out some)
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      // Skip host, connection headers
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Add SIGMACODE context
    if (session?.user?.id) {
      headers.set('X-Sigmacode-User-Id', session.user.id);
    }
    headers.set('X-Request-ID', requestId);

    logger.info(
      {
        requestId,
        method,
        difyUrl,
        userId: session?.user?.id,
      },
      'Proxying to Dify',
    );

    // Make request to Dify
    const difyResponse = await fetch(difyUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get response
    const responseData = await difyResponse.text();
    let jsonData;
    try {
      jsonData = JSON.parse(responseData);
    } catch {
      jsonData = responseData;
    }

    // Firewall Post-Check (nur falls aktiv und Ausgabetext ermittelbar)
    if (applyFw && jsonData && typeof jsonData === 'object') {
      try {
        const answer =
          typeof (jsonData as any).answer === 'string'
            ? (jsonData as any).answer
            : typeof (jsonData as any)?.data?.answer === 'string'
              ? (jsonData as any).data.answer
              : null;
        if (answer) {
          const post = await firewall.checkOutput(answer, session?.user?.id);
          if (!post.allowed) {
            logger.warn({ requestId, threats: post.threats }, 'Firewall blocked response output');
            return NextResponse.json(
              { error: 'Response blocked by firewall', threats: post.threats },
              { status: 400 },
            );
          }
        }
      } catch (e) {
        logger.error({ e }, 'Firewall post-check failed');
      }
    }

    // Return proxied response
    return NextResponse.json(jsonData, {
      status: difyResponse.status,
      headers: {
        'X-Request-ID': requestId,
      },
    });
  } catch (error) {
    logger.error({ error, requestId }, 'Dify proxy error');

    return NextResponse.json(
      {
        error: 'Proxy error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
