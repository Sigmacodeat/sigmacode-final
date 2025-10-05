import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { alerts } from '@/database/schema/alerts';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const resolveAlertSchema = z.object({
  userId: z.string(),
  reason: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const alertId = params.id;

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = resolveAlertSchema.parse(body);

    // Check if alert exists
    const db = await getDb();
    const existingAlert = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);

    if (!existingAlert.length) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const alert = existingAlert[0];

    // Check if alert can be resolved (should be new or acknowledged)
    if (alert.status === 'resolved') {
      return NextResponse.json({ error: 'Alert is already resolved' }, { status: 400 });
    }

    if (alert.status === 'dismissed') {
      return NextResponse.json({ error: 'Cannot resolve a dismissed alert' }, { status: 400 });
    }

    // Update alert status to resolved
    await db
      .update(alerts)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: validatedData.userId,
        resolvedReason: validatedData.reason,
        updatedAt: new Date(),
      })
      .where(eq(alerts.id, alertId));

    // Fetch updated alert
    const updatedAlert = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);

    return NextResponse.json({
      alert: updatedAlert[0],
      message: 'Alert resolved successfully',
    });
  } catch (error: unknown) {
    console.error('Error resolving alert:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to resolve alert' }, { status: 500 });
  }
}
