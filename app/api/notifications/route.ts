import { NextResponse } from 'next/server';

// Simple in-memory store (for demo only). Replace with DB in production.
let NOTIFICATIONS: Array<{
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}> = [];

export async function GET() {
  return NextResponse.json({
    items: NOTIFICATIONS.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item = {
    id,
    type: (body?.type as any) || 'info',
    title: body?.title || 'Notification',
    message: body?.message || 'New event',
    read: false,
    createdAt: new Date().toISOString(),
  };
  NOTIFICATIONS.push(item);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE() {
  NOTIFICATIONS = [];
  return NextResponse.json({ ok: true });
}
