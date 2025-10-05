import { NextRequest, NextResponse } from 'next/server';
import { sendPushToAll } from '@/lib/push';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: message, icon } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const result = await sendPushToAll(title, message, icon);

    return NextResponse.json({
      success: true,
      sent: result?.successful,
      failed: result?.failed,
      total: result?.total,
    });
  } catch (error: any) {
    console.error('Push notification error:', error);
    return NextResponse.json({ error: 'Failed to send push notifications' }, { status: 500 });
  }
}
