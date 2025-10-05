/**
 * SIGMACODE AI - Tools API (DB-backed)
 * Liefert die Tools direkt aus der Datenbank (Tabelle `tools`).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { getDb } from '@/database/db';
import { tools as toolsTable } from '@/database/schema';
import { and, eq, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const db = await getDb();

    // Build query
    let rows: Array<{
      id: string;
      name: string;
      category: string;
      description: string | null;
      icon: string | null;
      requires_auth: boolean;
      auth_type: string | null;
      is_enabled: boolean;
      created_at: Date;
    }> = [];

    if (category) {
      rows = (await db
        .select()
        .from(toolsTable)
        .where(and(eq(toolsTable.isEnabled, true), eq(toolsTable.category, category)))
        .orderBy(sql`lower(${toolsTable.name})`)) as any;
    } else {
      rows = (await db
        .select()
        .from(toolsTable)
        .where(eq(toolsTable.isEnabled, true))
        .orderBy(sql`lower(${toolsTable.name})`)) as any;
    }

    // Map DB columns to API output and wrap in { tools, total, categories }
    const tools = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      description: r.description ?? undefined,
      icon: r.icon ?? undefined,
      requiresAuth: r.requires_auth,
      authType: r.auth_type ?? undefined,
      isEnabled: r.is_enabled,
    }));

    const categories = Array.from(new Set(rows.map((r) => r.category))).sort();

    return NextResponse.json({
      tools,
      total: tools.length,
      categories,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load tools' }, { status: 500 });
  }
}
