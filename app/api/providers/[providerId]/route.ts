import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/database/db';
import { aiProviders } from '@/database/schema/aiProviders';
import { eq } from 'drizzle-orm';

// Schema für Updates eines Providers (spiegelt die Collection-Route wider)
const UpdateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  baseUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  rateLimits: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/providers/[providerId] - Hole einen Provider
export async function GET(request: NextRequest, { params }: { params: { providerId: string } }) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    const db = await getDb();
    const rows = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.id, params.providerId))
      .limit(1);
    const provider = rows[0];

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (provider.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Sensible Felder (apiKey) nicht zurückgeben
    const { apiKey: _omit, ...safe } = provider as any;

    return NextResponse.json({ success: true, provider: safe });
  } catch (error) {
    console.error('Get provider error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/providers/[providerId] - Update provider
export async function PUT(request: NextRequest, { params }: { params: { providerId: string } }) {
  try {
    const body = await request.json();
    const validatedData = UpdateProviderSchema.parse(body);

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    const db = await getDb();
    const providerArr = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.id, params.providerId))
      .limit(1);
    const provider = providerArr[0];

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (provider.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Falls als Default markiert, andere Defaults deaktivieren
    if (validatedData.isDefault) {
      await db
        .update(aiProviders)
        .set({ isDefault: false })
        .where(eq(aiProviders.tenantId, tenantId));
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.apiKey !== undefined) updateData.apiKey = validatedData.apiKey;
    if (validatedData.baseUrl !== undefined) updateData.baseUrl = validatedData.baseUrl;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.isDefault !== undefined) updateData.isDefault = validatedData.isDefault;
    if (validatedData.rateLimits !== undefined) updateData.rateLimits = validatedData.rateLimits;
    if (validatedData.metadata !== undefined) updateData.metadata = validatedData.metadata;

    await db.update(aiProviders).set(updateData).where(eq(aiProviders.id, params.providerId));

    return NextResponse.json({
      success: true,
      message: 'Provider updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Update provider error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/providers/[providerId] - Delete provider
export async function DELETE(request: NextRequest, { params }: { params: { providerId: string } }) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    const db = await getDb();
    const providerArr = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.id, params.providerId))
      .limit(1);
    const provider = providerArr[0];

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (provider.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await db.delete(aiProviders).where(eq(aiProviders.id, params.providerId));

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully',
    });
  } catch (error) {
    console.error('Delete provider error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
