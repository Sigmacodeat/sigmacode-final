/**
 * SIGMACODE AI - Single Agent API
 *
 * GET, PATCH, DELETE für einzelnen Agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { agents } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { getServerAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/agents/[agentId]
export async function GET(req: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = params;
    const db = await getDb();

    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.ownerUserId, session.user.id)))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    logger.error({ error }, 'Failed to get agent');
    return NextResponse.json({ error: 'Failed to load agent' }, { status: 500 });
  }
}

// PATCH /api/agents/[agentId]
export async function PATCH(req: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = params;
    const body = await req.json();

    const db = await getDb();

    // Verify ownership
    const [existing] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.ownerUserId, session.user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Update
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.firewallEnabled !== undefined) updateData.firewallEnabled = body.firewallEnabled;
    if (body.firewallPolicy !== undefined) updateData.firewallPolicy = body.firewallPolicy;
    if (body.firewallConfig !== undefined) updateData.firewallConfig = body.firewallConfig;
    if (body.modelTier !== undefined) updateData.modelTier = body.modelTier;

    await db.update(agents).set(updateData).where(eq(agents.id, agentId));

    const [updated] = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);

    logger.info({ userId: session.user.id, agentId }, 'Agent updated');

    return NextResponse.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to update agent');
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

// DELETE /api/agents/[agentId]
export async function DELETE(req: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = params;
    const db = await getDb();

    // Verify ownership
    const [existing] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.ownerUserId, session.user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    await db.delete(agents).where(eq(agents.id, agentId));

    logger.info({ userId: session.user.id, agentId }, 'Agent deleted');

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to delete agent');
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
