import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ClientEnvelope {
  sessionId?: string;
  userId?: string;
  timestamp?: number;
  data: Array<Record<string, any>>; // events array vom Client (EnhancedAnalyticsManager)
}

// In-Memory Store für Dev (nicht für Produktion gedacht)
let inMemoryEvents: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClientEnvelope;

    if (!body || !Array.isArray(body.data)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const enriched = body.data.map((evt) => ({
      ...evt,
      serverTimestamp: Date.now(),
      sessionId: body.sessionId || evt.sessionId || 'unknown',
      userId: body.userId || evt.userId || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || evt.userAgent || 'unknown',
      url: request.headers.get('referer') || evt.url || 'unknown',
    }));

    inMemoryEvents.push(...enriched);
    if (inMemoryEvents.length > 20000) inMemoryEvents = inMemoryEvents.slice(-20000);

    // Optional: Persistenz in Prod (DB) – bewusst ausgelassen/vereinfacht

    return NextResponse.json({
      success: true,
      received: enriched.length,
      total: inMemoryEvents.length,
    });
  } catch (err) {
    console.error('POST /api/analytics/events error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
