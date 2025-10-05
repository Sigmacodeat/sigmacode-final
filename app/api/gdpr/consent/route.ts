import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo purposes. Replace with database in production.
let CONSENTS: Array<{
  id: string;
  userId: string;
  type: string;
  granted: boolean;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}> = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
  }

  const userConsents = CONSENTS.filter((c) => c.userId === userId);
  return NextResponse.json({ consents: userConsents });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, granted, ipAddress, userAgent } = body;

    if (!userId || !type || typeof granted !== 'boolean') {
      return NextResponse.json(
        { error: 'userId, type, and granted are required' },
        { status: 400 },
      );
    }

    // Remove existing consent of same type for user
    CONSENTS = CONSENTS.filter((c) => !(c.userId === userId && c.type === type));

    // Add new consent
    const consent = {
      id: `${userId}-${type}-${Date.now()}`,
      userId,
      type,
      granted,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
    };

    CONSENTS.push(consent);

    return NextResponse.json({
      success: true,
      consent,
      message: `Consent for ${type} ${granted ? 'granted' : 'revoked'}`,
    });
  } catch (error: any) {
    console.error('GDPR consent error:', error);
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');

  if (!userId || !type) {
    return NextResponse.json({ error: 'userId and type parameters are required' }, { status: 400 });
  }

  const beforeCount = CONSENTS.length;
  CONSENTS = CONSENTS.filter((c) => !(c.userId === userId && c.type === type));
  const removed = beforeCount !== CONSENTS.length;

  return NextResponse.json({
    success: removed,
    message: removed ? `Consent for ${type} removed` : 'Consent not found',
  });
}
