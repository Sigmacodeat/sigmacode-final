import { NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { settings } from '@/database/schema/settings';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    // versuche health_check aus settings zu lesen, sonst SELECT 1 als Fallback
    try {
      const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'health_check'))
        .limit(1);
      const val = rows?.[0]?.value ?? 'missing';
      return NextResponse.json({ ok: true, source: 'settings', value: val });
    } catch {
      // Fallback: einfacher Ping
      await db.execute('SELECT 1');
      return NextResponse.json({ ok: true, source: 'ping' });
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}
