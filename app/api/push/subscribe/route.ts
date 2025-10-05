import { NextResponse } from 'next/server';

// In-Memory store for demo purposes. Replace with DB in production.
let SUBSCRIPTIONS: any[] = [];

export async function GET() {
  return NextResponse.json({ count: SUBSCRIPTIONS.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    // prevent duplicates
    if (!SUBSCRIPTIONS.find((s) => s.endpoint === body.endpoint)) {
      SUBSCRIPTIONS.push(body);
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad Request' }, { status: 400 });
  }
}

export async function DELETE() {
  SUBSCRIPTIONS = [];
  return NextResponse.json({ ok: true });
}
