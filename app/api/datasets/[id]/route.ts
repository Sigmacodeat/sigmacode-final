/**
 * SIGMACODE AI - Dataset API (Single)
 *
 * GET    /api/datasets/:id - Get dataset by ID
 * PATCH  /api/datasets/:id - Update dataset
 * DELETE /api/datasets/:id - Delete dataset
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { getDb } from '@/database/db';
import { datasets, documents } from '@/database/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { UpdateDatasetInput } from '@/types/knowledge';

type RouteContext = {
  params: { id: string };
};

/**
 * GET /api/datasets/:id
 * Get a specific dataset with statistics
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Fetch dataset
    const db = await getDb();
    const [dataset] = await db
      .select()
      .from(datasets)
      .where(and(eq(datasets.id, id), eq(datasets.userId, session.user.id)));

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Get document statistics
    const [stats] = await db
      .select({
        documentCount: sql<number>`count(*)::int`,
        totalSize: sql<number>`sum(${documents.size})::int`,
      })
      .from(documents)
      .where(eq(documents.datasetId, id));

    // Update cached statistics if different
    if (
      stats &&
      (stats.documentCount !== dataset.documentCount || stats.totalSize !== dataset.totalSize)
    ) {
      await db
        .update(datasets)
        .set({
          documentCount: stats.documentCount || 0,
          totalSize: stats.totalSize || 0,
          updatedAt: new Date(),
        })
        .where(eq(datasets.id, id));

      dataset.documentCount = stats.documentCount || 0;
      dataset.totalSize = stats.totalSize || 0;
    }

    return NextResponse.json(dataset);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/datasets/:id
 * Update a dataset
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const body: Partial<UpdateDatasetInput> = await request.json();

    // Check ownership
    const db = await getDb();
    const [existing] = await db
      .select()
      .from(datasets)
      .where(and(eq(datasets.id, id), eq(datasets.userId, session.user.id)));

    if (!existing) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Update dataset
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;
    if (body.embeddingModel !== undefined) updateData.embeddingModel = body.embeddingModel;
    if (body.chunkSize !== undefined) updateData.chunkSize = body.chunkSize;
    if (body.chunkOverlap !== undefined) updateData.chunkOverlap = body.chunkOverlap;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.settings !== undefined) updateData.settings = body.settings;

    const [updated] = await db
      .update(datasets)
      .set(updateData)
      .where(eq(datasets.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating dataset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/datasets/:id
 * Delete a dataset and all its documents
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Check ownership
    const db = await getDb();
    const [existing] = await db
      .select()
      .from(datasets)
      .where(and(eq(datasets.id, id), eq(datasets.userId, session.user.id)));

    if (!existing) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Delete dataset (cascades to documents and chunks)
    await db.delete(datasets).where(eq(datasets.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
