/**
 * SIGMACODE AI - Agent Management API
 *
 * CRUD für Agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { agents } from '@/database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getServerAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/agents - Liste alle Agents des Users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const userAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.ownerUserId, session.user.id))
      .orderBy(desc(agents.createdAt));

    logger.info({ userId: session.user.id, count: userAgents.length }, 'Agents listed');

    return NextResponse.json({
      agents: userAgents,
      total: userAgents.length,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to list agents');
    return NextResponse.json({ error: 'Failed to load agents' }, { status: 500 });
  }
}

// POST /api/agents - Erstelle neuen Agent
export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, firewallEnabled, firewallPolicy, firewallConfig, modelTier } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = await getDb();
    const newAgent = {
      id: crypto.randomUUID(),
      ownerUserId: session.user.id,
      name,
      description: description || null,
      firewallEnabled: firewallEnabled ?? false,
      firewallPolicy: firewallPolicy || 'off',
      firewallConfig: firewallConfig || null,
      modelTier: modelTier || null,
    };

    await db.insert(agents).values(newAgent);

    logger.info({ userId: session.user.id, agentId: newAgent.id }, 'Agent created');

    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    logger.error({ error }, 'Failed to create agent');
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
