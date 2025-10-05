import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ApiKeyService } from '@/lib/api-keys';
import { getDb } from '@/database/db';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';

export interface AuthenticatedRequest extends NextRequest {
  apiKey?: Awaited<ReturnType<typeof ApiKeyService.validateApiKey>>['key'];
  userId?: string;
  userRole?: string;
}

export async function apiKeyAuthMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Skip auth for certain paths
  const skipPaths = ['/api/health', '/api/auth/login', '/api/auth/register'];
  if (skipPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return null;
  }

  // Check for API key in header
  const apiKey =
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  // Validate API key
  const validation = await ApiKeyService.validateApiKey(apiKey);

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error || 'Invalid API key' }, { status: 401 });
  }

  const key = validation.key!;

  // Check rate limits
  const rateLimitCheck = await ApiKeyService.checkRateLimit(key.id);

  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        limit: key.rateLimitRpm,
        resetIn: '60 seconds',
      },
      { status: 429 },
    );
  }

  // Add API key info to request
  (request as AuthenticatedRequest).apiKey = key;
  (request as AuthenticatedRequest).userId = key.userId;

  // Fetch user role from database
  const db = await getDb();
  const userArr = await db.select().from(users).where(eq(users.id, key.userId)).limit(1);
  const user = userArr[0];

  (request as AuthenticatedRequest).userRole = user?.role || 'user';

  return null;
}

export async function withApiKeyAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  const authError = await apiKeyAuthMiddleware(request);

  if (authError) {
    return authError;
  }

  return handler(request as AuthenticatedRequest);
}
