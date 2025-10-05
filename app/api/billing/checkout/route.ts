import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/database/db';
import { subscriptions } from '@/database/schema/subscriptions';
import { eq } from 'drizzle-orm';
import { verifyJwt, getServerAuthSession } from '@/lib/auth';

export const runtime = 'nodejs';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Map internal plan IDs to Stripe Price IDs via env vars (monthly/yearly)
const PLAN_PRICE_MAP: Record<string, { monthly?: string; yearly?: string } | undefined> = {
  plan_starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
  },
  plan_pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  plan_business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
  },
  // Enterprise wird typischerweise über Sales abgewickelt; kein Direkt‑Checkout
  plan_enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE,
  },
};

// Stripe wird im Handler initialisiert, falls konfiguriert

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    if (process.env.NODE_ENV !== 'production') {
      userId = 'dev-user';
    } else {
      // 1) Versuche Bearer-Token aus Authorization-Header zu verifizieren
      const authz = req.headers.get('authorization') || undefined;
      const user = await verifyJwt(authz);
      if (user?.sub) {
        userId = String(user.sub);
      } else {
        // 2) Fallback: NextAuth Session (Cookie-basiert)
        const session = await getServerAuthSession();
        const sessionUser: any = session?.user;
        if (sessionUser?.id) {
          userId = String(sessionUser.id);
        }
      }
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const raw: unknown = await req.json().catch(() => ({}));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const { planId, billing, locale } = raw as {
      planId?: string;
      billing?: 'monthly' | 'yearly';
      locale?: string;
    };
    if (!planId) return NextResponse.json({ error: 'planId is required' }, { status: 400 });

    const loc = locale && typeof locale === 'string' ? `/${locale}` : '';

    if (planId === 'plan_free') {
      // No Stripe checkout required; mark subscription as active free plan
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const db = await getDb();
      const existingArr = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);
      const existing = existingArr[0];
      if (!existing) {
        await db.insert(subscriptions).values({
          id: `sub_free_${userId}`,
          userId,
          planId,
          status: 'active',
          startAt: new Date(),
        });
      } else {
        await db
          .update(subscriptions)
          .set({ planId, status: 'active', updatedAt: new Date() })
          .where(eq(subscriptions.userId, userId));
      }
      return NextResponse.json({ success: true, url: `${APP_URL}${loc}/account/billing` });
    }

    const planMap = PLAN_PRICE_MAP[planId || ''];
    if (!planMap)
      return NextResponse.json({ error: 'Stripe price not configured for plan' }, { status: 400 });
    // Standard: monatlich, außer ausdrücklich yearly
    const cycle: 'monthly' | 'yearly' = billing === 'yearly' ? 'yearly' : 'monthly';
    const priceId = planMap[cycle];
    if (!priceId)
      return NextResponse.json(
        { error: `Stripe price not configured for ${planId} (${cycle})` },
        { status: 400 },
      );
    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    const stripe = new Stripe(STRIPE_SECRET_KEY, { typescript: true });
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${APP_URL}${loc}/account/billing?success=1`,
      cancel_url: `${APP_URL}${loc}/pricing?canceled=1`,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: userId!, planId, billing: cycle, locale: locale || '' },
    });

    return NextResponse.json({ success: true, url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
