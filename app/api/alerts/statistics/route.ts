export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { alerts } from '@/database/schema/alerts';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';
    const days = parseInt(searchParams.get('days') || '30');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId parameter is required' }, { status: 400 });
    }

    const db = await getDb();
    // Calculate date range
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get total alerts count
    const totalAlertsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(eq(alerts.tenantId, tenantId));

    const totalAlerts = totalAlertsResult[0]?.count || 0;

    // Get alerts by severity
    const alertsBySeverity = await db
      .select({
        severity: alerts.severity,
        count: sql<number>`count(*)`,
      })
      .from(alerts)
      .where(and(eq(alerts.tenantId, tenantId), gte(alerts.triggeredAt, since)))
      .groupBy(alerts.severity);

    const severityMap: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    alertsBySeverity.forEach((row) => {
      severityMap[row.severity] = row.count;
    });

    // Get alerts by category
    const alertsByCategory = await db
      .select({
        category: alerts.category,
        count: sql<number>`count(*)`,
      })
      .from(alerts)
      .where(and(eq(alerts.tenantId, tenantId), gte(alerts.triggeredAt, since)))
      .groupBy(alerts.category);

    const categoryMap: Record<string, number> = {
      security_threat: 0,
      system_error: 0,
      performance_issue: 0,
      compliance_violation: 0,
      ml_anomaly: 0,
      manual_trigger: 0,
    };

    alertsByCategory.forEach((row) => {
      categoryMap[row.category] = row.count;
    });

    // Get resolved alerts count
    const resolvedAlertsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(
        and(
          eq(alerts.tenantId, tenantId),
          eq(alerts.status, 'resolved'),
          gte(alerts.triggeredAt, since),
        ),
      );

    const resolvedAlerts = resolvedAlertsResult[0]?.count || 0;

    // Calculate resolution rate
    const resolutionRate = totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0;

    // Calculate average resolution time
    const avgResolutionTimeResult = await db
      .select({
        avgTime: sql<number>`avg(
          CASE
            WHEN ${alerts.resolvedAt} IS NOT NULL
            THEN (strftime('%s', ${alerts.resolvedAt}) - strftime('%s', ${alerts.triggeredAt})) / 60.0
            ELSE NULL
          END
        )`,
      })
      .from(alerts)
      .where(
        and(
          eq(alerts.tenantId, tenantId),
          eq(alerts.status, 'resolved'),
          gte(alerts.triggeredAt, since),
        ),
      );

    const avgResolutionTime = avgResolutionTimeResult[0]?.avgTime || 0;

    // Get alerts by status
    const alertsByStatus = await db
      .select({
        status: alerts.status,
        count: sql<number>`count(*)`,
      })
      .from(alerts)
      .where(and(eq(alerts.tenantId, tenantId), gte(alerts.triggeredAt, since)))
      .groupBy(alerts.status);

    const statusMap: Record<string, number> = {
      new: 0,
      acknowledged: 0,
      resolved: 0,
      dismissed: 0,
    };

    alertsByStatus.forEach((row) => {
      statusMap[row.status] = row.count;
    });

    const recentAlerts = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.tenantId, tenantId),
          gte(alerts.triggeredAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
        ),
      )
      .orderBy(desc(alerts.triggeredAt))
      .limit(10);

    const statistics = {
      alertsBySeverity: severityMap,
      alertsByCategory: categoryMap,
      alertsByStatus: statusMap,
      resolutionRate,
      avgResolutionTime,
      recentAlertsCount: recentAlerts.length,
      timeRange: {
        since: since.toISOString(),
        days,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch alert statistics' }, { status: 500 });
  }
}
