import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { and, desc, gte } from 'drizzle-orm';
import { getDb } from '@/database/db';
import { analyticsOverview } from '@/database/schema/analytics';

const QuerySchema = z.object({
  since: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      since: url.searchParams.get('since') || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const db = await getDb();
    const since = parsed.data.since ? new Date(parsed.data.since) : undefined;

    const rows = await db
      .select()
      .from(analyticsOverview)
      .where(since ? gte(analyticsOverview.ts, since) : (undefined as any))
      .orderBy(desc(analyticsOverview.ts))
      .limit(1);

    const data = rows[0] || null;
    return NextResponse.json({ data });
  } catch (err) {
    console.error('GET /api/analytics/overview error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
