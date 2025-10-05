export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { getDb } from '@/database/db';
import { firewallLogs } from '@/database/schema/firewall';
import { eq, desc, gt, and, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    const role = (session?.user as any)?.role;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();

    // Validation schema
    const eventSchema = z.object({
      eventType: z.enum([
        'firewall_block',
        'firewall_allow',
        'firewall_analyze',
        'ml_analysis',
        'manual_override',
      ]),
      requestId: z.string().min(1),
      userId: z.string().min(1),
      ipAddress: z.string().min(1),
      endpoint: z.string().min(1),
      userAgent: z.string().min(1),
      riskScore: z.number().min(0).max(1),
      threatType: z.string().optional(),
      action: z.enum(['block', 'allow', 'analyze', 'override']),
      metadata: z.record(z.any()).optional(),
    });

    const validationResult = eventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const eventData = validationResult.data;
    const eventId = uuidv4();

    // Get database connection
    const db = await getDb();

    // Insert firewall event
    await db.insert(firewallLogs).values({
      requestId: eventData.requestId,
      backend: 'firewall',
      policy: 'event-logging',
      action: eventData.action,
      latencyMs: 0,
      status: 200,
      userId: eventData.userId,
      meta: {
        eventType: eventData.eventType,
        ipAddress: eventData.ipAddress,
        endpoint: eventData.endpoint,
        userAgent: eventData.userAgent,
        riskScore: eventData.riskScore,
        threatType: eventData.threatType,
        metadata: eventData.metadata,
      },
    });

    return NextResponse.json(
      {
        success: true,
        eventId,
        message: 'Firewall event created successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating firewall event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    const role = (session?.user as any)?.role;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDb();

    // Get total count
    const totalResult = await db.select({ count: sql`count(*)` }).from(firewallLogs);

    const total = Number(totalResult[0]?.count) || 0;

    // Get events
    const events = await db
      .select()
      .from(firewallLogs)
      .orderBy(desc(firewallLogs.ts))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      events,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching firewall events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
