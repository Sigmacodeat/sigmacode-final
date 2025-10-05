import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth, type AuthenticatedRequest } from '@/lib/api-key-middleware';
import { ApiKeyService } from '@/lib/api-keys';
import { z } from 'zod';

const UpdateApiKeySchema = z.object({
  name: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  status: z.enum(['active', 'revoked']).optional(),
  rateLimitRpm: z.number().min(1).max(10000).optional(),
  rateLimitTpm: z.number().min(1).max(1000000).optional(),
  quotaLimit: z.number().min(1).max(10000000).optional(),
});

export async function DELETE(request: NextRequest, { params }: { params: { keyId: string } }) {
  return withApiKeyAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const success = await ApiKeyService.deleteApiKey(params.keyId, req.userId!);

      if (!success) {
        return NextResponse.json({ error: 'API key not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'API key deleted successfully',
      });
    } catch (error) {
      console.error('Delete API key error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PATCH(request: NextRequest, { params }: { params: { keyId: string } }) {
  return withApiKeyAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const validatedData = UpdateApiKeySchema.parse(body);

      // For now, we'll handle updates through delete/create
      // In a real implementation, you'd have an update method in the service
      const currentKeys = await ApiKeyService.getUserApiKeys(req.userId!);
      const currentKey = currentKeys.find((k: any) => k.id === params.keyId);

      if (!currentKey) {
        return NextResponse.json({ error: 'API key not found' }, { status: 404 });
      }

      // Delete old key
      await ApiKeyService.deleteApiKey(params.keyId, req.userId!);

      // Create new key with updated values
      const newApiKey = await ApiKeyService.createApiKey({
        userId: req.userId!,
        name: validatedData.name ?? currentKey.name ?? undefined,
        scopes: validatedData.scopes ?? (currentKey.scopes as unknown as string[] | undefined),
        rateLimitRpm: validatedData.rateLimitRpm ?? currentKey.rateLimitRpm ?? undefined,
        rateLimitTpm: validatedData.rateLimitTpm ?? currentKey.rateLimitTpm ?? undefined,
        quotaLimit: validatedData.quotaLimit ?? currentKey.quotaLimit ?? undefined,
      });

      return NextResponse.json({
        success: true,
        apiKey: newApiKey,
        message: 'API key updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 },
        );
      }

      console.error('Update API key error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
