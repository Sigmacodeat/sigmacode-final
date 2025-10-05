import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { and, desc, eq, gte } from 'drizzle-orm';
import { getDb } from '@/database/db';
import {
  analyticsUsageByEndpoint,
  analyticsUsageByUserAgent,
  analyticsUsageByCountry,
  analyticsUsageByHour,
} from '@/database/schema/analytics';

const QuerySchema = z.object({
  type: z.enum(['endpoint', 'userAgent', 'country', 'hour']).default('endpoint'),
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
      type: (url.searchParams.get('type') || 'endpoint') as any,
      range: (url.searchParams.get('range') || '24h') as any,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { type, range } = parsed.data;
    const db = await getDb();
    const since = rangeToSince(range);

    switch (type) {
      case 'endpoint': {
        const rows = await db
          .select()
          .from(analyticsUsageByEndpoint)
          .where(gte(analyticsUsageByEndpoint.ts, since))
          .orderBy(desc(analyticsUsageByEndpoint.ts));
        return NextResponse.json({ data: rows });
      }
      case 'userAgent': {
        const rows = await db
          .select()
          .from(analyticsUsageByUserAgent)
          .where(gte(analyticsUsageByUserAgent.ts, since))
          .orderBy(desc(analyticsUsageByUserAgent.ts));
        return NextResponse.json({ data: rows });
      }
      case 'country': {
        const rows = await db
          .select()
          .from(analyticsUsageByCountry)
          .where(gte(analyticsUsageByCountry.ts, since))
          .orderBy(desc(analyticsUsageByCountry.ts));
        return NextResponse.json({ data: rows });
      }
      case 'hour': {
        const rows = await db
          .select()
          .from(analyticsUsageByHour)
          .where(gte(analyticsUsageByHour.ts, since))
          .orderBy(desc(analyticsUsageByHour.ts));
        return NextResponse.json({ data: rows });
      }
      default:
        return NextResponse.json({ data: [] });
    }
  } catch (err) {
    console.error('GET /api/analytics/usage error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
