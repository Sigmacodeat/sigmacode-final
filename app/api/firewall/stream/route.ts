export const runtime = 'nodejs';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyJwt } from '@/app/lib/auth';
import { getDb } from '@/database/db';
import { auditLog } from '@/database/schema/auditLog';
import { and, desc, gte, eq, sql } from 'drizzle-orm';

// Lightweight SSE stream of firewall-related audit events
// Strategy: poll audit_log table every 2s for latest agent.invoke events and stream as SSE
// RBAC: only admins may access

function toSSE(data: any, event?: string) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return `${event ? `event: ${event}\n` : ''}data: ${payload}\n\n`;
}

function isValidISODate(s: string): boolean {
  // Basic ISO 8601 check (YYYY-MM-DDTHH:mm:ss.sssZ or with timezone offset)
  // Falls back to Date parsing if regex passt
  const isoRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)(Z|[+-]\d{2}:?\d{2})$/;
  if (!isoRegex.test(s)) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

export async function GET(req: NextRequest) {
  // Dev-friendly auth: allow in development; require Bearer admin JWT in production
  if (process.env.NODE_ENV === 'production') {
    const authz = req.headers.get('authorization') || undefined;
    const user = await verifyJwt(authz);
    const roles = (
      Array.isArray((user as any)?.roles)
        ? (user as any).roles
        : user?.role
          ? [String(user.role)]
          : []
    ) as string[];
    const isAdmin = !!user?.sub && roles.includes('admin');
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse since cursor from query (?since=<iso>)
  const { searchParams } = new URL(req.url);
  const sinceParam = searchParams.get('since');
  const agentIdParam = searchParams.get('agentId');
  const phases = ['pre', 'post', 'shadow', 'shadow_error', 'error'];

  // Request correlation
  const requestId =
    req.headers.get('x-request-id') ||
    (globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2));

  const sinceDate = (() => {
    if (!sinceParam) return new Date(Date.now() - 5 * 60 * 1000); // default last 5 minutes
    if (!isValidISODate(sinceParam)) return new Date(Date.now() - 5 * 60 * 1000);
    const d = new Date(sinceParam);
    return isNaN(d.getTime()) ? new Date(Date.now() - 5 * 60 * 1000) : d;
  })();

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const encoder = new TextEncoder();
      // Initial hello
      controller.enqueue(encoder.encode(`retry: 5000\n`));
      controller.enqueue(
        encoder.encode(toSSE({ ok: true, message: 'firewall stream started', requestId }, 'hello')),
      );

      let lastTs = sinceDate;
      let closed = false;

      const poll = async () => {
        try {
          const db = await getDb();
          // Select recent firewall-related audit events
          const rows = await db
            .select({
              id: auditLog.id,
              createdAt: auditLog.createdAt,
              actorType: auditLog.actorType,
              actorId: auditLog.actorId,
              action: auditLog.action,
              resourceType: auditLog.resourceType,
              resourceId: auditLog.resourceId,
              payload: auditLog.payload,
            })
            .from(auditLog)
            .where(
              and(
                eq(auditLog.action, 'agent.invoke' as any) as any,
                gte(
                  auditLog.createdAt,
                  sql`to_timestamp(${Math.floor(lastTs.getTime() / 1000)})` as any,
                ),
                ...(agentIdParam ? [eq(auditLog.resourceId, agentIdParam as any) as any] : []),
              ) as any,
            )
            .orderBy(desc(auditLog.createdAt))
            .limit(200);

          // Filter to firewall phases
          const filtered = rows
            .filter((r) => phases.includes((r as any)?.payload?.phase))
            .sort(
              (a, b) =>
                new Date(a.createdAt as unknown as string).getTime() -
                new Date(b.createdAt as unknown as string).getTime(),
            );

          for (const r of filtered) {
            const evt = {
              id: r.id,
              ts: r.createdAt,
              actorType: r.actorType,
              actorId: r.actorId,
              resourceType: r.resourceType,
              resourceId: r.resourceId,
              phase: (r as any)?.payload?.phase,
              requestId: (r as any)?.payload?.requestId,
              backend: (r as any)?.payload?.backend,
              status: (r as any)?.payload?.status,
              ok: (r as any)?.payload?.ok,
              latency: (r as any)?.payload?.latency,
              firewall: (r as any)?.payload?.firewall,
              mode: (r as any)?.payload?.mode,
              message: (r as any)?.payload?.message,
            };
            controller.enqueue(encoder.encode(toSSE(evt, 'firewall')));
            const t = new Date(r.createdAt as unknown as string);
            if (t > lastTs) lastTs = t;
          }

          // Emit cursor update if progressed
          controller.enqueue(encoder.encode(toSSE({ cursor: lastTs.toISOString() }, 'cursor')));
        } catch (e) {
          controller.enqueue(
            encoder.encode(toSSE({ error: (e as any)?.message ?? 'poll_failed' }, 'error')),
          );
        }
      };

      // Kick off immediate poll then interval
      await poll();
      const pollInterval = setInterval(poll, 2000);
      const heartbeatInterval = setInterval(() => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(toSSE({ ts: new Date().toISOString(), requestId }, 'heartbeat')),
        );
      }, 15000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(pollInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      };

      // Abort handling
      req.signal.addEventListener('abort', close);
    },
  });

  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Request-Id': requestId,
    },
  });
}
