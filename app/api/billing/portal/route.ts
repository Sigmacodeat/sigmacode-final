import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/database/db';
import { subscriptions } from '@/database/schema/subscriptions';
import { eq } from 'drizzle-orm';
import { verifyJwt, getServerAuthSession } from '@/lib/auth';

export const runtime = 'nodejs';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    if (process.env.NODE_ENV !== 'production') {
      userId = 'dev-user';
    } else {
      // 1) Bearer-Token prüfen
      const authz = req.headers.get('authorization') || undefined;
      const user = await verifyJwt(authz);
      if (user?.sub) {
        userId = String(user.sub);
      } else {
        // 2) NextAuth-Session
        const session = await getServerAuthSession();
        const sessionUser: any = session?.user;
        if (sessionUser?.id) userId = String(sessionUser.id);
      }
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || '';
    const loc = locale ? `/${locale}` : '';

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const db = await getDb();
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, String(userId)))
      .limit(1);
    const sub = rows[0] as any | undefined;

    const customerId = sub?.externalCustomerId;
    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer found for user' }, { status: 404 });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { typescript: true });
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}${loc}/account/billing`,
    });

    // Redirect direkt zum Stripe-Kundenportal
    return NextResponse.redirect(portal.url, 302);
  } catch (err) {
    console.error('Portal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
