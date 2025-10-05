import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting store (for demo). Replace with Redis in production.
const RATE_LIMITS = new Map<string, { count: number; resetTime: number }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const apiKey = searchParams.get('apiKey');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Mock rate limit data - replace with actual rate limiting logic
  const mockLimits = Array.from({ length: 20 }, (_, i) => ({
    id: `limit-${i}`,
    identifier: userId || apiKey || `user-${i}`,
    type: userId ? 'user' : apiKey ? 'api_key' : 'ip',
    limit: 1000,
    current: Math.floor(Math.random() * 800),
    window: 3600, // 1 hour in seconds
    resetTime: Date.now() + Math.random() * 3600000,
    createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }));

  const filtered = mockLimits.filter((l) => {
    if (userId && l.identifier !== userId) return false;
    if (apiKey && l.identifier !== apiKey) return false;
    return true;
  });

  const paginated = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    limits: paginated,
    pagination: {
      total: filtered.length,
      limit,
      offset,
      hasMore: offset + limit < filtered.length,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, type, limit, window } = body;

    if (!identifier || !type || !limit || !window) {
      return NextResponse.json(
        { error: 'identifier, type, limit, and window are required' },
        { status: 400 },
      );
    }

    // Mock rate limit creation - replace with actual rate limiting setup
    const rateLimitId = `limit-${Date.now()}`;
    const rateLimit = {
      id: rateLimitId,
      identifier,
      type,
      limit,
      current: 0,
      window,
      resetTime: Date.now() + window * 1000,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      rateLimit,
      message: `Rate limit created for ${type}: ${identifier}`,
    });
  } catch (error: any) {
    console.error('Rate limit creation error:', error);
    return NextResponse.json({ error: 'Failed to create rate limit' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitId = searchParams.get('id');

  if (!limitId) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
  }

  // Mock rate limit deletion - replace with actual cleanup
  return NextResponse.json({
    success: true,
    message: `Rate limit ${limitId} removed`,
  });
}
