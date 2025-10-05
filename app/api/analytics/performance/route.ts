import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { and, between, desc, eq, gte, lte } from 'drizzle-orm';
import { getDb } from '@/database/db';
import { analyticsPerformanceTS } from '@/database/schema/analytics';

const QuerySchema = z.object({
  metric: z.enum(['responseTime', 'throughput', 'errorRate', 'latency']),
  range: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
});

function rangeToSince(range: string): Date {
  const now = new Date();
  switch (range) {
    case '1h':
      return new Date(now.getTime() - 1 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

let inMemoryPerf: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      userId?: string;
      timestamp?: number;
      data: Array<Record<string, any>>;
    };

    if (!body || !Array.isArray(body.data)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const enriched = body.data.map((m) => ({
      ...m,
      serverTimestamp: Date.now(),
      sessionId: body.sessionId || m.sessionId || 'unknown',
      userId: body.userId || m.userId || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || m.userAgent || 'unknown',
      url: request.headers.get('referer') || m.url || 'unknown',
    }));

    inMemoryPerf.push(...enriched);
    if (inMemoryPerf.length > 20000) inMemoryPerf = inMemoryPerf.slice(-20000);

    return NextResponse.json({
      success: true,
      received: enriched.length,
      total: inMemoryPerf.length,
    });
  } catch (err) {
    console.error('POST /api/analytics/performance error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      metric: (url.searchParams.get('metric') || 'responseTime') as any,
      range: (url.searchParams.get('range') || '24h') as any,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { metric, range } = parsed.data;
    const db = await getDb();
    const since = rangeToSince(range);

    try {
      const rows = await db
        .select()
        .from(analyticsPerformanceTS)
        .where(
          and(eq(analyticsPerformanceTS.metric, metric), gte(analyticsPerformanceTS.ts, since)),
        )
        .orderBy(desc(analyticsPerformanceTS.ts));

      return NextResponse.json({ data: rows });
    } catch (e: any) {
      // Postgres: relation does not exist
      if (e && (e.code === '42P01' || String(e?.message || '').includes('does not exist'))) {
        console.warn('[analytics/performance] Tabelle fehlt, liefere leeres Ergebnis zurück');
        return NextResponse.json({ data: [] });
      }
      throw e;
    }
  } catch (err) {
    console.error('GET /api/analytics/performance error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
