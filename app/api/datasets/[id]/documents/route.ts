/**
 * SIGMACODE AI - Documents API
 *
 * GET  /api/datasets/:id/documents - List documents in dataset
 * POST /api/datasets/:id/documents - Create new document
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { getDb } from '@/database/db';
import { datasets, documents } from '@/database/schema';
import { eq, desc, asc, and, or, ilike, sql } from 'drizzle-orm';
import type { CreateDocumentInput, SearchDocumentsParams } from '@/types/knowledge';

type RouteContext = {
  params: { id: string };
};

/**
 * GET /api/datasets/:id/documents
 * List documents in a dataset
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: datasetId } = context.params;
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = (searchParams.get('sortBy') as SearchDocumentsParams['sortBy']) || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Check dataset access
    const db = await getDb();
    const [dataset] = await db
      .select()
      .from(datasets)
      .where(and(eq(datasets.id, datasetId), eq(datasets.userId, session.user.id)));

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Build query conditions
    const conditions = [eq(documents.datasetId, datasetId)];

    if (query) {
      conditions.push(
        or(ilike(documents.name, `%${query}%`), ilike(documents.content, `%${query}%`))!,
      );
    }

    if (status) {
      conditions.push(eq(documents.status, status as any));
    }

    // Execute query
    const orderColumn = documents[sortBy];
    const orderFn = sortOrder === 'asc' ? asc : desc;

    const result = await db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(and(...conditions));

    const total = countResult?.count || 0;

    return NextResponse.json({
      documents: result,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/datasets/:id/documents
 * Create a new document in dataset
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: datasetId } = context.params;
    const body: Omit<CreateDocumentInput, 'datasetId'> = await request.json();

    // Check dataset access
    const db = await getDb();
    const [dataset] = await db
      .select()
      .from(datasets)
      .where(and(eq(datasets.id, datasetId), eq(datasets.userId, session.user.id)));

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Document name is required' }, { status: 400 });
    }

    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json({ error: 'Document content is required' }, { status: 400 });
    }

    // Create document
    const [newDocument] = await db
      .insert(documents)
      .values({
        datasetId,
        name: body.name.trim(),
        originalName: body.originalName || null,
        mimeType: body.mimeType || 'text/plain',
        size: body.size,
        content: body.content,
        summary: body.summary || null,
        fileUrl: body.fileUrl || null,
        fileHash: null, // TODO: Calculate hash
        status: 'pending',
        processingError: null,
        chunkCount: 0,
        embeddingStatus: 'pending',
        metadata: body.metadata || {},
      })
      .returning();

    // Update dataset statistics
    await db
      .update(datasets)
      .set({
        documentCount: sql`${datasets.documentCount} + 1`,
        totalSize: sql`${datasets.totalSize} + ${body.size}`,
        updatedAt: new Date(),
      })
      .where(eq(datasets.id, datasetId));

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
