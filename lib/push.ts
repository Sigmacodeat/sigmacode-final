import webpush, { PushSubscription } from 'web-push';

// In-Memory store for demo purposes. Replace with DB in production.
let SUBSCRIPTIONS: PushSubscription[] = [];

export async function GET() {
  return { count: SUBSCRIPTIONS.length };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.endpoint) {
      return Response.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    // prevent duplicates
    if (!SUBSCRIPTIONS.find((s) => s.endpoint === body.endpoint)) {
      SUBSCRIPTIONS.push(body);
    }
    return Response.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bad Request';
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  SUBSCRIPTIONS = [];
  return Response.json({ ok: true });
}

export async function sendPushToAll(title: string, body: string, icon?: string) {
  if (!process.env.WEB_PUSH_PUBLIC_KEY || !process.env.WEB_PUSH_PRIVATE_KEY) {
    console.warn('Web Push keys not configured');
    return;
  }

  webpush.setVapidDetails(
    process.env.WEB_PUSH_CONTACT_EMAIL || 'mailto:admin@sigmacode.ai',
    process.env.WEB_PUSH_PUBLIC_KEY,
    process.env.WEB_PUSH_PRIVATE_KEY,
  );

  const payload = JSON.stringify({
    title,
    body,
    icon: icon || '/favicon-32x32.png',
    badge: '/favicon-16x16.png',
    tag: 'sigmacode-notification',
    data: { url: '/' },
  });

  const results = await Promise.allSettled(
    SUBSCRIPTIONS.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err: unknown) => {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 410 || statusCode === 404) {
          // Subscription expired or invalid, remove it
          SUBSCRIPTIONS = SUBSCRIPTIONS.filter((s) => s.endpoint !== sub.endpoint);
        }
        throw err;
      }),
    ),
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - successful;

  return { successful, failed, total: results.length };
}
