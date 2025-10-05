export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getDb } from '@/database/db';
import { firewallPolicies, auditLog } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { policySchema } from '@/app/lib/validation/firewall-policy';

// Validation erfolgt zentral über policySchema (app/lib/validation/firewall-policy)

function errorResponse(message: string, status: number, issues?: unknown) {
  const payload: Record<string, unknown> = { status: 'error', message };
  if (issues) payload.issues = issues;
  return NextResponse.json(payload, { status });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return errorResponse('Policy ID required', 400);
    }

    const db = await getDb();

    const policy = await db
      .select()
      .from(firewallPolicies)
      .where(eq(firewallPolicies.id, id))
      .limit(1);

    if (policy.length === 0) {
      return errorResponse('Policy not found', 404);
    }

    return NextResponse.json({ policy: policy[0] });
  } catch (err) {
    console.error('GET /api/firewall/policies/[id] error:', err);
    return errorResponse('Internal Server Error', 500);
  }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Policy ID required' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch (err) {
      return errorResponse('Invalid JSON', 400);
    }

    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return errorResponse('Request body must be a JSON object', 400);
    }

    const parsed = policySchema.safeParse({ id, ...(body as Record<string, unknown>) });
    if (!parsed.success) {
      return errorResponse('Validation failed', 422, parsed.error.issues);
    }

    const { name, mode } = parsed.data as { name: string; mode: 'enforce' | 'shadow' | 'off' };
    const db = await getDb();

    // Check if policy exists
    const existing = await db
      .select()
      .from(firewallPolicies)
      .where(eq(firewallPolicies.id, id))
      .limit(1);

    if (existing.length === 0) {
      return errorResponse('Policy not found', 404);
    }

    // Update policy
    await db
      .update(firewallPolicies)
      .set({
        name,
        mode,
        updatedAt: new Date(),
      })
      .where(eq(firewallPolicies.id, id));

    // Return updated policy
    const updated = await db
      .select()
      .from(firewallPolicies)
      .where(eq(firewallPolicies.id, id))
      .limit(1);

    // Audit Log
    try {
      await db.insert(auditLog).values({
        id: randomUUID(),
        actorType: 'service',
        actorId: 'api',
        action: 'firewall.policy.patch',
        resourceType: 'firewall_policy',
        resourceId: id,
        payload: { before: existing[0], after: updated[0] },
        previousHash: null,
        hash: randomUUID(),
      });
    } catch (e) {
      console.warn('[audit] failed to append PATCH log', e);
    }
    return NextResponse.json({ policy: updated[0] });
  } catch (err) {
    console.error('PATCH /api/firewall/policies/[id] error:', err);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Policy ID required' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const parsed = policySchema.safeParse({ id, ...(body as Record<string, unknown>) });
    if (!parsed.success) {
      return NextResponse.json(
        { status: 'error', error: 'Validation failed', issues: parsed.error.issues },
        { status: 422 },
      );
    }

    const { name, mode, rules } = parsed.data as {
      name: string;
      mode: 'enforce' | 'shadow' | 'off';
      rules: any[];
    };
    const db = await getDb();

    // Check if policy exists
    const existing = await db
      .select()
      .from(firewallPolicies)
      .where(eq(firewallPolicies.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Update policy
    await db
      .update(firewallPolicies)
      .set({
        name,
        mode,
        updatedAt: new Date(),
      })
      .where(eq(firewallPolicies.id, id));

    // TODO: Handle rules update when schema supports it

    // Return updated policy
    const updated = await db
      .select()
      .from(firewallPolicies)
      .where(eq(firewallPolicies.id, id))
      .limit(1);

    return NextResponse.json({ policy: updated[0] });
  } catch (err) {
    console.error('PUT /api/firewall/policies/[id] error:', err);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Policy ID required' }, { status: 400 });
    }

    const db = await getDb();

    // Check if policy exists
    const existing = await db
      .select()
      .from(firewallPolicies)
      .where(eq(firewallPolicies.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Delete policy
    await db.delete(firewallPolicies).where(eq(firewallPolicies.id, id));

    // Audit Log
    try {
      await db.insert(auditLog).values({
        id: randomUUID(),
        actorType: 'service',
        actorId: 'api',
        action: 'firewall.policy.delete',
        resourceType: 'firewall_policy',
        resourceId: id,
        payload: { before: existing[0], after: null },
        previousHash: null,
        hash: randomUUID(),
      });
    } catch (e) {
      console.warn('[audit] failed to append DELETE log', e);
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE /api/firewall/policies/[id] error:', err);
    return errorResponse('Internal Server Error', 500);
  }
}
