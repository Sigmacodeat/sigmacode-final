import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/database/db';
import { subscriptions } from '@/database/schema/subscriptions';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Fail-soft bei fehlender Konfiguration, um Build/SSR nicht zu brechen
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.warn('Stripe webhook invoked but environment not configured. Skipping.');
    return NextResponse.json({ received: true, skipped: true }, { status: 200 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { typescript: true });
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Stripe signature verification failed.', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const planId = session.metadata?.planId;
        const userId = session.metadata?.userId;
        if (userId && planId) {
          const db = await getDb();
          const existingArr = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .limit(1);
          const existing = existingArr[0];
          if (!existing) {
            await db.insert(subscriptions).values({
              id: session.subscription?.toString() || `sub_${userId}`,
              userId,
              planId,
              status: 'active',
              startAt: new Date(),
              externalCustomerId: session.customer?.toString(),
              externalSubscriptionId: session.subscription?.toString(),
            });
          } else {
            await db
              .update(subscriptions)
              .set({
                planId,
                status: 'active',
                updatedAt: new Date(),
                externalCustomerId: session.customer?.toString(),
                externalSubscriptionId: session.subscription?.toString(),
              })
              .where(eq(subscriptions.userId, userId));
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const externalSubscriptionId = sub.id;
        const status = sub.status; // trialing, active, past_due, canceled, unpaid, incomplete, ...
        {
          const db = await getDb();
          await db
            .update(subscriptions)
            .set({ status, updatedAt: new Date() })
            .where(eq(subscriptions.externalSubscriptionId, externalSubscriptionId));
        }
        break;
      }
      default:
        // Ignore other events for now
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handling error:', err);
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }
}
