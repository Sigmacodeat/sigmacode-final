export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { and, desc, eq, gte, like, sql } from 'drizzle-orm';
import { getDb } from '@/database/db';
import { firewallLogs } from '@/database/schema/firewall';

const QuerySchema = z.object({
  since: z.string().datetime().optional(),
  backend: z.string().min(1).optional(),
  policy: z.string().min(1).optional(),
  action: z.enum(['allow', 'block', 'shadow-allow', 'shadow-block']).optional(),
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0),
  format: z.enum(['json', 'csv']).default('json'),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      since: url.searchParams.get('since') || undefined,
      backend: url.searchParams.get('backend') || undefined,
      policy: url.searchParams.get('policy') || undefined,
      action: (url.searchParams.get('action') as any) || undefined,
      q: url.searchParams.get('q') || undefined,
      limit: url.searchParams.get('limit') || undefined,
      offset: url.searchParams.get('offset') || undefined,
      format: (url.searchParams.get('format') as any) || 'json',
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { since, backend, policy, action, q, limit, offset, format } = parsed.data;
    const db = await getDb();

    const where = [
      since ? gte(firewallLogs.ts, new Date(since)) : undefined,
      backend ? eq(firewallLogs.backend, backend) : undefined,
      policy ? eq(firewallLogs.policy, policy) : undefined,
      action ? eq(firewallLogs.action, action) : undefined,
      q ? like(firewallLogs.requestId, `%${q}%`) : undefined,
    ].filter(Boolean) as any[];

    const rows = await db
      .select()
      .from(firewallLogs)
      .where(
        where.length
          ? where.length === 1
            ? where[0]
            : (and as any)(...where)
          : (undefined as any),
      )
      .orderBy(desc(firewallLogs.ts))
      .limit(limit)
      .offset(offset);

    const totalResult = await db.execute(
      sql<number>`select count(*)::int as count from firewall_logs`,
    );
    const total = (totalResult as any).rows?.[0]?.count ?? 0;

    if (format === 'csv') {
      const csv = generateCSV(rows);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="firewall-logs.csv"',
        },
      });
    }

    return NextResponse.json({ data: rows, total });
  } catch (err) {
    console.error('GET /api/firewall/logs error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = [
    'ID',
    'Timestamp',
    'Request ID',
    'Backend',
    'Policy',
    'Action',
    'Latency (ms)',
    'Status',
    'User ID',
    'Meta',
  ];

  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      [
        row.id,
        row.ts,
        row.requestId,
        row.backend,
        row.policy,
        row.action,
        row.latencyMs,
        row.status,
        row.userId || '',
        JSON.stringify(row.meta || {}),
      ].join(','),
    ),
  ];

  return csvRows.join('\n');
}
