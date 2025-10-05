export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { getDb } from '@/database/db';
import { firewallLogs } from '@/database/schema/firewall';
import { and, between, count, desc, eq, gte, lte, sql } from 'drizzle-orm';

// GET /api/firewall/stats
// Liefert aggregierte Metriken für das Firewall-Dashboard
export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(req.url);
    // Optionales Zeitfenster: ?from=ISO&to=ISO (Default: letzte 24h)
    const fromParam = url.searchParams.get('from');
    const toParam = url.searchParams.get('to');

    const now = new Date();
    const to = toParam ? new Date(toParam) : now;
    const from = fromParam ? new Date(fromParam) : new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const db = await getDb();

    // Gesamtanzahl im Fenster
    const totalQ = await db.execute(
      sql`select count(*)::int as count from firewall_logs where ts between ${from} and ${to}`,
    );
    const totalRequests: number = (totalQ as any).rows?.[0]?.count ?? 0;

    // Allowed/Blocked Counters
    const allowedQ = await db.execute(
      sql`select count(*)::int as count from firewall_logs where action in ('allow','shadow-allow') and ts between ${from} and ${to}`,
    );
    const blockedQ = await db.execute(
      sql`select count(*)::int as count from firewall_logs where action in ('block','shadow-block') and ts between ${from} and ${to}`,
    );
    const allowedRequests: number = (allowedQ as any).rows?.[0]?.count ?? 0;
    const blockedRequests: number = (blockedQ as any).rows?.[0]?.count ?? 0;

    // Durchschnittslatenz
    const avgLatencyQ = await db.execute(
      sql`select coalesce(avg(latency_ms),0)::int as avg from firewall_logs where ts between ${from} and ${to}`,
    );
    const averageLatency: number = (avgLatencyQ as any).rows?.[0]?.avg ?? 0;

    // Top Threats (aus meta.threat_matches[].category gezählt)
    // Hinweis: funktioniert, wenn meta ein JSON mit Array threat_matches enthält.
    const topThreatsQ = await db.execute(sql`
      with expanded as (
        select jsonb_array_elements(coalesce(meta->'threat_matches','[]'::jsonb)) as m
        from firewall_logs
        where ts between ${from} and ${to}
      )
      select (m->>'category') as category, count(*)::int as count
      from expanded
      where (m->>'category') is not null
      group by (m->>'category')
      order by count desc
      limit 10
    `);
    const topThreats = (topThreatsQ as any).rows ?? [];

    // Aktuelle Betriebsart (Feature Flags aus ENV)
    const isEnabled = (process.env.FIREWALL_ENABLED || 'true').toLowerCase() === 'true';
    const mode = process.env.FIREWALL_MODE || 'enforce'; // enforce | shadow | off

    return NextResponse.json({
      totalRequests,
      blockedRequests,
      allowedRequests,
      averageLatency,
      topThreats,
      isEnabled,
      mode,
      window: { from: from.toISOString(), to: to.toISOString() },
    });
  } catch (err) {
    console.error('GET /api/firewall/stats error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
