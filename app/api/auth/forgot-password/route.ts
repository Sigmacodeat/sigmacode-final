import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/database/db';
import { users } from '@/database/schema/users';
import { passwordResetTokens } from '@/database/schema/passwordResetTokens';
import { eq, and, gt } from 'drizzle-orm';

// POST /api/auth/forgot-password
// Erstellt einen Password-Reset-Token für die angegebene E-Mail
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-Mail-Adresse ist erforderlich' }, { status: 400 });
    }

    // E-Mail auf gültiges Format prüfen (einfache Validierung)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse' }, { status: 400 });
    }

    const db = await getDb();

    // User anhand E-Mail suchen
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (!user) {
      // Für Sicherheit: Immer erfolgreiche Antwort senden, auch wenn User nicht existiert
      // (verhindert User-Enumeration)
      return NextResponse.json({
        message: 'Wenn ein Account mit dieser E-Mail existiert, wurde eine E-Mail versendet.',
      });
    }

    // Bestehende nicht-verwendete Tokens für diesen User löschen
    await db
      .delete(passwordResetTokens)
      .where(
        and(eq(passwordResetTokens.userId, user.id), gt(passwordResetTokens.expiresAt, new Date())),
      );

    // Neuen Token erstellen
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde gültig

    await db.insert(passwordResetTokens).values({
      token,
      userId: user.id,
      email: email.toLowerCase(),
      expiresAt,
    });

    // TODO: E-Mail versenden mit Reset-Link
    // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;
    // await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({
      message: 'Wenn ein Account mit dieser E-Mail existiert, wurde eine E-Mail versendet.',
    });
  } catch (error) {
    console.error('[forgot-password] error:', error);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
