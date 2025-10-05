import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { alertRules } from '@/database/schema/alerts';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createAlertRuleSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().optional(),
  tenantId: z.string(),
  triggerType: z.enum(['ml_prediction', 'threshold', 'pattern', 'manual']),
  triggerConfig: z.record(z.any()),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  channels: z.array(z.enum(['email', 'slack', 'webhook', 'sms', 'dashboard'])),
  cooldownMinutes: z.number().min(0).max(1440).default(5),
  groupSimilar: z.boolean().default(true),
  groupWindowMinutes: z.number().min(1).max(1440).default(15),
  isActive: z.boolean().default(true),
});

const updateAlertRuleSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  description: z.string().optional(),
  triggerType: z.enum(['ml_prediction', 'threshold', 'pattern', 'manual']).optional(),
  triggerConfig: z.record(z.any()).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  channels: z.array(z.enum(['email', 'slack', 'webhook', 'sms', 'dashboard'])).optional(),
  cooldownMinutes: z.number().min(0).max(1440).optional(),
  groupSimilar: z.boolean().optional(),
  groupWindowMinutes: z.number().min(1).max(1440).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const isActive = searchParams.get('isActive');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId parameter is required' }, { status: 400 });
    }

    const whereConditions = [eq(alertRules.tenantId, tenantId)];

    if (isActive !== null) {
      const active = isActive === 'true';
      whereConditions.push(eq(alertRules.isActive, active));
    }

    const db = await getDb();
    const query = db
      .select()
      .from(alertRules)
      .where(and(...whereConditions));

    const rules = await query;

    return NextResponse.json({
      rules,
      total: rules.length,
    });
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    return NextResponse.json({ error: 'Failed to fetch alert rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAlertRuleSchema.parse(body);

    const ruleData = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: validatedData.name,
      description: validatedData.description,
      tenantId: validatedData.tenantId,
      triggerType: validatedData.triggerType,
      triggerConfig: validatedData.triggerConfig,
      severity: validatedData.severity,
      channels: validatedData.channels,
      cooldownMinutes: validatedData.cooldownMinutes,
      groupSimilar: validatedData.groupSimilar,
      groupWindowMinutes: validatedData.groupWindowMinutes,
      isActive: validatedData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDb();
    await db.insert(alertRules).values(ruleData);

    return NextResponse.json(
      {
        rule: ruleData,
        message: 'Alert rule created successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating alert rule:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to create alert rule' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('id');

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateAlertRuleSchema.parse(body);

    // Check if rule exists
    const db = await getDb();
    const existingRule = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.id, ruleId))
      .limit(1);

    if (!existingRule.length) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.triggerType !== undefined) updateData.triggerType = validatedData.triggerType;
    if (validatedData.triggerConfig !== undefined)
      updateData.triggerConfig = validatedData.triggerConfig;
    if (validatedData.severity !== undefined) updateData.severity = validatedData.severity;
    if (validatedData.channels !== undefined) updateData.channels = validatedData.channels;
    if (validatedData.cooldownMinutes !== undefined)
      updateData.cooldownMinutes = validatedData.cooldownMinutes;
    if (validatedData.groupSimilar !== undefined)
      updateData.groupSimilar = validatedData.groupSimilar;
    if (validatedData.groupWindowMinutes !== undefined)
      updateData.groupWindowMinutes = validatedData.groupWindowMinutes;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    await db.update(alertRules).set(updateData).where(eq(alertRules.id, ruleId));

    const updatedRule = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.id, ruleId))
      .limit(1);

    return NextResponse.json({
      rule: updatedRule[0],
      message: 'Alert rule updated successfully',
    });
  } catch (error) {
    console.error('Error updating alert rule:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to update alert rule' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('id');

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    // Check if rule exists und löschen
    const db = await getDb();
    const existingRule = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.id, ruleId))
      .limit(1);

    if (!existingRule.length) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 });
    }

    await db.delete(alertRules).where(eq(alertRules.id, ruleId));

    return NextResponse.json({
      message: 'Alert rule deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting alert rule:', error);
    return NextResponse.json({ error: 'Failed to delete alert rule' }, { status: 500 });
  }
}
