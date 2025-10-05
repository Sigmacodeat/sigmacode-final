import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb } from '@/database/db';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';

const RegisterSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    name: z.string().min(1).max(120).optional(),
  })
  .strict();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = RegisterSchema.parse(body);

    const emailNorm = email.toLowerCase();

    const db = await getDb();
    // existiert schon?
    const [existing] = await db.select().from(users).where(eq(users.email, emailNorm));
    if (existing) {
      return NextResponse.json({ error: 'E-Mail bereits registriert' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    await db.insert(users).values({
      id,
      email: emailNorm,
      name: name || null,
      passwordHash,
      role: 'user',
    } as any);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues?.[0]?.message || 'Ungültige Eingabe' },
        { status: 400 },
      );
    }
    console.error('/api/auth/register', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
