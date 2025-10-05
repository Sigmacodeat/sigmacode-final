export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { desc, gte } from 'drizzle-orm';
import { getDb } from '@/database/db';
import { analyticsSystemHealth } from '@/database/schema/analytics';

const QuerySchema = z.object({
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      range: (url.searchParams.get('range') || '24h') as any,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const db = await getDb();
    const since = rangeToSince(parsed.data.range);

    const rows = await db
      .select()
      .from(analyticsSystemHealth)
      .where(gte(analyticsSystemHealth.ts, since))
      .orderBy(desc(analyticsSystemHealth.ts));

    // Liefere den neuesten Eintrag + History
    const latest = rows[0] || null;
    return NextResponse.json({ latest, history: rows });
  } catch (err) {
    console.error('GET /api/analytics/system error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
