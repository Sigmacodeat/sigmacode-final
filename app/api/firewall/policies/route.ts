export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { firewallPolicies } from '@/database/schema';
import { desc, eq, and } from 'drizzle-orm';
import { z } from 'zod';

const CreatePolicySchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1).max(128),
  description: z.string().max(512).optional(),
  priority: z.number().int().min(0).max(100000).optional(),
  isActive: z.boolean().optional(),
  mode: z.enum(['enforce', 'shadow']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenantId');
    const isActive = url.searchParams.get('isActive');
    const db = await getDb();

    let rows;
    if (tenantId && isActive !== null) {
      rows = await db
        .select()
        .from(firewallPolicies)
        .where(
          and(
            eq(firewallPolicies.tenantId as any, tenantId) as any,
            eq(firewallPolicies.isActive as any, isActive === 'true') as any,
          ) as any,
        )
        .orderBy(desc(firewallPolicies.priority), desc(firewallPolicies.createdAt as any));
    } else if (tenantId) {
      rows = await db
        .select()
        .from(firewallPolicies)
        .where(eq(firewallPolicies.tenantId as any, tenantId) as any)
        .orderBy(desc(firewallPolicies.priority), desc(firewallPolicies.createdAt as any));
    } else if (isActive !== null) {
      rows = await db
        .select()
        .from(firewallPolicies)
        .where(eq(firewallPolicies.isActive as any, isActive === 'true') as any)
        .orderBy(desc(firewallPolicies.priority), desc(firewallPolicies.createdAt as any));
    } else {
      rows = await db
        .select()
        .from(firewallPolicies)
        .orderBy(desc(firewallPolicies.priority), desc(firewallPolicies.createdAt as any));
    }

    return NextResponse.json({
      policies: rows,
      total: rows.length,
    });
  } catch (err) {
    console.error('GET /api/firewall/policies error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = CreatePolicySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { tenantId, name, description, priority, isActive, mode } = parsed.data;
    const db = await getDb();

    // Check if priority already exists for this tenant
    const existingPolicies = await db
      .select()
      .from(firewallPolicies)
      .where(eq(firewallPolicies.tenantId as any, tenantId) as any);

    const priorityExists = existingPolicies.some((policy) => policy.priority === priority);
    if (priorityExists) {
      return NextResponse.json(
        { error: 'Priority already exists for this tenant' },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    await db.insert(firewallPolicies).values({
      id,
      tenantId,
      name,
      description: description ?? null,
      priority: priority ?? 100,
      isActive: isActive ?? true,
      mode: mode ?? 'enforce',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      policyId: id,
      message: 'Policy created successfully',
    });
  } catch (err) {
    console.error('POST /api/firewall/policies error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
