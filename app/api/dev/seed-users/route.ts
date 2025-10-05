import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '@/database/db';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const db = await getDb();

    const testUsers = [
      {
        email: 'admin@sigmacode.ai',
        name: 'Admin User',
        role: 'admin' as const,
        password: 'password123',
      },
      {
        email: 'user@sigmacode.ai',
        name: 'Demo User',
        role: 'user' as const,
        password: 'password123',
      },
    ];

    const results: any[] = [];

    for (const u of testUsers) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, u.email.toLowerCase()));
      const hash = await bcrypt.hash(u.password, 10);

      if (existing) {
        await db
          .update(users)
          .set({
            name: u.name,
            role: u.role as any,
            passwordHash: hash,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id));
        results.push({ email: u.email, action: 'updated' });
      } else {
        await db.insert(users).values({
          id: randomUUID(),
          email: u.email.toLowerCase(),
          name: u.name,
          role: u.role as any,
          tenantId: 'global',
          tokenBalance: 0,
          passwordHash: hash,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        results.push({ email: u.email, action: 'created' });
      }
    }

    return NextResponse.json({ ok: true, users: results });
  } catch (err: any) {
    console.error('[seed-users] error:', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
