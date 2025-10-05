import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { desc, gte } from 'drizzle-orm';
import { getDb } from '@/database/db';
import {
  analyticsErrorsRecent,
  analyticsErrorsByType,
  analyticsErrorsTrends,
} from '@/database/schema/analytics';

const QuerySchema = z.object({
  type: z.enum(['recent', 'byType', 'trends']).default('recent'),
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
    const typeParam = url.searchParams.get('type') || 'recent';
    const rangeParam = url.searchParams.get('range') || '24h';
    const parsed = QuerySchema.safeParse({
      type: typeParam,
      range: rangeParam,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { type, range } = parsed.data;
    const db = await getDb();
    const since = rangeToSince(range);

    if (type === 'recent') {
      const rows = await db
        .select()
        .from(analyticsErrorsRecent)
        .where(gte(analyticsErrorsRecent.ts, since))
        .orderBy(desc(analyticsErrorsRecent.ts));
      return NextResponse.json({ data: rows });
    }
    if (type === 'byType') {
      const rows = await db
        .select()
        .from(analyticsErrorsByType)
        .where(gte(analyticsErrorsByType.ts, since))
        .orderBy(desc(analyticsErrorsByType.ts));
      return NextResponse.json({ data: rows });
    }
    // trends (date,count)
    const rows = await db.select().from(analyticsErrorsTrends);
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('GET /api/analytics/errors error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
