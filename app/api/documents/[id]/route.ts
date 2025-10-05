/**
 * SIGMACODE AI - Document API (Single)
 *
 * GET    /api/documents/:id - Get document by ID
 * PATCH  /api/documents/:id - Update document
 * DELETE /api/documents/:id - Delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-nextauth';
import { getDb } from '@/database/db';
import { datasets, documents } from '@/database/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { UpdateDocumentInput } from '@/types/knowledge';

type RouteContext = {
  params: { id: string };
};

/**
 * GET /api/documents/:id
 * Get a specific document
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Fetch document with dataset
    const db = await getDb();
    const result = await db
      .select({
        document: documents,
        dataset: datasets,
      })
      .from(documents)
      .innerJoin(datasets, eq(datasets.id, documents.datasetId))
      .where(and(eq(documents.id, id), eq(datasets.userId, session.user.id)));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(result[0].document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/documents/:id
 * Update a document
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const body: Partial<UpdateDocumentInput> = await request.json();

    // Check ownership through dataset
    const db = await getDb();
    const result = await db
      .select({
        document: documents,
        dataset: datasets,
      })
      .from(documents)
      .innerJoin(datasets, eq(datasets.id, documents.datasetId))
      .where(and(eq(documents.id, id), eq(datasets.userId, session.user.id)));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const existing = result[0].document;

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.content !== undefined) updateData.content = body.content;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    // Update document
    const [updated] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Check ownership through dataset
    const db = await getDb();
    const result = await db
      .select({
        document: documents,
        dataset: datasets,
      })
      .from(documents)
      .innerJoin(datasets, eq(datasets.id, documents.datasetId))
      .where(and(eq(documents.id, id), eq(datasets.userId, session.user.id)));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const existing = result[0].document;

    // Delete document (cascades to chunks)
    await db.delete(documents).where(eq(documents.id, id));

    // Update dataset statistics
    await db
      .update(datasets)
      .set({
        documentCount: sql`${datasets.documentCount} - 1`,
        totalSize: sql`${datasets.totalSize} - ${existing.size}`,
        updatedAt: new Date(),
      })
      .where(eq(datasets.id, existing.datasetId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
