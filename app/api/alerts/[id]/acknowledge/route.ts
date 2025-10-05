import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { alerts } from '@/database/schema/alerts';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const acknowledgeAlertSchema = z.object({
  userId: z.string(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const alertId = params.id;

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = acknowledgeAlertSchema.parse(body);

    // Check if alert exists and is not already acknowledged
    const db = await getDb();
    const existingAlert = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);

    if (!existingAlert.length) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const alert = existingAlert[0];

    if (alert.status !== 'new') {
      return NextResponse.json(
        { error: 'Alert is not in new status and cannot be acknowledged' },
        { status: 400 },
      );
    }
    // Update alert status to acknowledged
    await db
      .update(alerts)
      .set({
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy: validatedData.userId,
        updatedAt: new Date(),
      })
      .where(eq(alerts.id, alertId));

    // Fetch updated alert
    const updatedAlert = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);

    return NextResponse.json({
      alert: updatedAlert[0],
      message: 'Alert acknowledged successfully',
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to acknowledge alert' }, { status: 500 });
  }
}
