import { NextRequest, NextResponse } from 'next/server';
import { aiProviderService, DEFAULT_MODELS } from '@/lib/ai-provider-service';
import { getDb } from '@/database/db';
import { aiProviders } from '@/database/schema/aiProviders';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const CreateProviderSchema = z.object({
  name: z.string().min(1),
  providerType: z.enum(['openai', 'anthropic', 'mistral', 'llama', 'custom']),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
  isDefault: z.boolean().default(false),
  rateLimits: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  baseUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  rateLimits: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/providers - List all providers for tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const db = await getDb();
    const providers = await db.select().from(aiProviders).where(eq(aiProviders.tenantId, tenantId));

    // Remove sensitive data
    const sanitizedProviders = providers.map((provider) => ({
      id: provider.id,
      tenantId: provider.tenantId,
      name: provider.name,
      providerType: provider.providerType,
      baseUrl: provider.baseUrl,
      isActive: provider.isActive,
      isDefault: provider.isDefault,
      rateLimits: provider.rateLimits,
      models: DEFAULT_MODELS[provider.providerType as keyof typeof DEFAULT_MODELS] || [],
      metadata: provider.metadata,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      providers: sanitizedProviders,
    });
  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/providers - Create new provider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateProviderSchema.parse(body);

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      const db = await getDb();
      await db
        .update(aiProviders)
        .set({ isDefault: false })
        .where(eq(aiProviders.tenantId, tenantId));
    }

    const provider = await aiProviderService.createProvider({
      tenantId,
      name: validatedData.name,
      providerType: validatedData.providerType,
      apiKey: validatedData.apiKey,
      baseUrl: validatedData.baseUrl ?? null,
      isActive: true,
      isDefault: validatedData.isDefault,
      rateLimits: validatedData.rateLimits || {},
      tokenCosts: {},
      models: [],
      metadata: validatedData.metadata || {},
    });

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        tenantId: provider.tenantId,
        name: provider.name,
        providerType: provider.providerType,
        baseUrl: provider.baseUrl,
        isActive: provider.isActive,
        isDefault: provider.isDefault,
        models: DEFAULT_MODELS[provider.providerType as keyof typeof DEFAULT_MODELS] || [],
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Create provider error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
