import { NextResponse } from 'next/server';

// Achtung: nutzt denselben In-Memory-Store wie ../route.ts
// In Produktion bitte durch persistente DB ersetzen.
// Durch module scope kann es je nach bundling getrennt sein; hier einfache Demo:
let NOTIFICATIONS: Array<{
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}> = [];

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const idx = NOTIFICATIONS.findIndex((n) => n.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  NOTIFICATIONS[idx].read = true;
  return NextResponse.json(NOTIFICATIONS[idx]);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const before = NOTIFICATIONS.length;
  NOTIFICATIONS = NOTIFICATIONS.filter((n) => n.id !== id);
  const removed = before !== NOTIFICATIONS.length;
  return NextResponse.json({ ok: removed });
}
