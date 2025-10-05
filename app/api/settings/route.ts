import { NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq, ilike, or } from 'drizzle-orm';
import { getDb } from '@/database/db';
import { settings, stringifySettingValue } from '@/database/schema/settings';
import { verifyJwt, requireRole } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

const upsertSchema = z.object({
  key: z.string().min(1),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.record(z.any())])
    .nullable()
    .optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  groupName: z.string().min(1).default('general'),
  isPublic: z.boolean().default(false),
});

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const includePrivate = (searchParams.get('includePrivate') || 'false').toLowerCase() === 'true';

    const authz = request.headers.get('authorization') || undefined;
    const user = await verifyJwt(authz);
    const isAdmin = requireRole(user, ['admin']);

    const conditions = [] as any[];
    if (q) {
      conditions.push(or(ilike(settings.key, `%${q}%`), ilike(settings.groupName, `%${q}%`)));
    }
    if (!(includePrivate && isAdmin)) {
      conditions.push(eq(settings.isPublic, true));
    }

    const rows = await db
      .select()
      .from(settings)
      .where(conditions.length ? and(...conditions) : (undefined as any))
      .orderBy(settings.groupName, settings.key);

    return NextResponse.json({ ok: true, items: rows });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authz = request.headers.get('authorization') || undefined;
    const user = await verifyJwt(authz);
    if (!requireRole(user, ['admin'])) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const db = await getDb();
    const { key, value, type, groupName, isPublic } = parsed.data;

    // Value stringifizieren entsprechend Typ, dann via Drizzle upsert
    const valueStr = stringifySettingValue(value as unknown, type);

    await db
      .insert(settings)
      .values({ key, value: valueStr, type, groupName, isPublic })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: valueStr,
          type,
          groupName,
          isPublic,
        },
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}
