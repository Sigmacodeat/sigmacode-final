import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth, type AuthenticatedRequest } from '@/lib/api-key-middleware';
import { ApiKeyService } from '@/lib/api-keys';
import { z } from 'zod';

const CreateApiKeySchema = z.object({
  name: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
  rateLimitRpm: z.number().min(1).max(10000).optional(),
  rateLimitTpm: z.number().min(1).max(1000000).optional(),
  quotaLimit: z.number().min(1).max(10000000).optional(),
});

export async function POST(request: NextRequest) {
  return withApiKeyAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const validatedData = CreateApiKeySchema.parse(body);

      const apiKey = await ApiKeyService.createApiKey({
        userId: req.userId!,
        name: validatedData.name,
        scopes: validatedData.scopes,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
        rateLimitRpm: validatedData.rateLimitRpm,
        rateLimitTpm: validatedData.rateLimitTpm,
        quotaLimit: validatedData.quotaLimit,
      });

      return NextResponse.json({
        success: true,
        apiKey: apiKey, // Only return the full key once
        message: 'API key created successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 },
        );
      }

      console.error('Create API key error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function GET(request: NextRequest) {
  return withApiKeyAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const apiKeys = await ApiKeyService.getUserApiKeys(req.userId!);

      // Remove sensitive data
      const sanitizedKeys = apiKeys.map((key: any) => ({
        id: key.id,
        keyId: key.keyId,
        name: key.name,
        scopes: key.scopes,
        status: key.status,
        expiresAt: key.expiresAt,
        rateLimitRpm: key.rateLimitRpm,
        rateLimitTpm: key.rateLimitTpm,
        quotaLimit: key.quotaLimit,
        quotaUsed: key.quotaUsed,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
      }));

      return NextResponse.json({
        success: true,
        apiKeys: sanitizedKeys,
      });
    } catch (error) {
      console.error('Get API keys error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
