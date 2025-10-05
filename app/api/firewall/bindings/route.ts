export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/database/db';
import { firewallBindings } from '@/database/schema/firewall_policies';
import { desc, eq, and } from 'drizzle-orm';

const CreateBindingSchema = z.object({
  tenantId: z.string().min(1),
  policyId: z.string().min(1),
  routePrefix: z.string().min(1),
  isActive: z.boolean().optional(),
});

const UpdateBindingSchema = z.object({
  isActive: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenantId');
    const db = await getDb();

    const rows = tenantId
      ? await db
          .select()
          .from(firewallBindings)
          .where(eq(firewallBindings.tenantId, tenantId))
          .orderBy(desc(firewallBindings.createdAt))
      : await db.select().from(firewallBindings).orderBy(desc(firewallBindings.createdAt));

    return NextResponse.json({ bindings: rows, total: rows.length });
  } catch (err) {
    console.error('GET /api/firewall/bindings error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = CreateBindingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { tenantId, policyId, routePrefix, isActive } = parsed.data;
    const db = await getDb();

    const id = crypto.randomUUID();
    await db.insert(firewallBindings).values({
      id,
      tenantId,
      policyId,
      routePrefix,
      isActive: isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, bindingId: id });
  } catch (err) {
    console.error('POST /api/firewall/bindings error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing binding ID' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = UpdateBindingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { isActive } = parsed.data;
    const db = await getDb();

    await db
      .update(firewallBindings)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(firewallBindings.id, id));

    return NextResponse.json({ success: true, message: 'Binding updated' });
  } catch (err) {
    console.error('PUT /api/firewall/bindings error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing binding ID' }, { status: 400 });
    }

    const db = await getDb();

    await db.delete(firewallBindings).where(eq(firewallBindings.id, id));

    return NextResponse.json({ success: true, message: 'Binding deleted' });
  } catch (err) {
    console.error('DELETE /api/firewall/bindings error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
