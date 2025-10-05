import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/database/db';
import { users } from '@/database/schema/users';
import { passwordResetTokens } from '@/database/schema/passwordResetTokens';
import { eq, and, gt, isNull } from 'drizzle-orm';

// POST /api/auth/reset-password
// Setzt das Passwort zurück mit einem gültigen Reset-Token
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token und Passwort sind erforderlich' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Token suchen und prüfen, ob noch gültig und nicht verwendet
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt),
        ),
      );

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Reset-Token' },
        { status: 400 },
      );
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(password, 10);

    // User finden und Passwort aktualisieren
    const [user] = await db.select().from(users).where(eq(users.id, resetToken.userId));

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    // Passwort aktualisieren
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId));

    // Token als verwendet markieren
    await db
      .update(passwordResetTokens)
      .set({
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokens.token, token));

    return NextResponse.json({
      message: 'Passwort erfolgreich zurückgesetzt',
    });
  } catch (error) {
    console.error('[reset-password] error:', error);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
