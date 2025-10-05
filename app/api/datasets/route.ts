/**
 * SIGMACODE AI - Datasets API
 *
 * GET  /api/datasets - List all datasets
 * POST /api/datasets - Create new dataset
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { getDb } from '@/database/db';
import { datasets } from '@/database/schema';
import { eq, desc, asc, and, or, ilike, sql } from 'drizzle-orm';
import type { Dataset, CreateDatasetInput } from '@/types/knowledge';

/**
 * GET /api/datasets
 * List datasets with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const tags = searchParams.get('tags')?.split(',');
    const isPublic = searchParams.get('isPublic');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy =
      (searchParams.get('sortBy') as 'name' | 'createdAt' | 'updatedAt') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Build query conditions
    const conditions = [
      // User can see their own datasets or public ones
      or(eq(datasets.userId, session.user.id), eq(datasets.isPublic, true)),
    ];

    // Add search query
    if (query) {
      conditions.push(
        or(ilike(datasets.name, `%${query}%`), ilike(datasets.description, `%${query}%`))!,
      );
    }

    // Add public filter
    if (isPublic !== null) {
      conditions.push(eq(datasets.isPublic, isPublic === 'true'));
    }

    // Ensure DB is initialized
    const db = await getDb();

    // Execute query
    const orderColumn = datasets[sortBy];
    const orderFn = sortOrder === 'asc' ? asc : desc;

    const result = await db
      .select()
      .from(datasets)
      .where(and(...conditions))
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(datasets)
      .where(and(...conditions));

    const total = countResult?.count || 0;

    return NextResponse.json({
      datasets: result,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/datasets
 * Create a new dataset
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateDatasetInput = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Dataset name is required' }, { status: 400 });
    }

    // Ensure DB is initialized
    const db = await getDb();

    // Create dataset
    const [newDataset] = await db
      .insert(datasets)
      .values({
        name: body.name.trim(),
        description: body.description || null,
        icon: body.icon || 'Database',
        color: body.color || 'blue',
        userId: session.user.id,
        isPublic: body.isPublic ?? false,
        embeddingModel: body.embeddingModel || 'text-embedding-ada-002',
        chunkSize: body.chunkSize || 512,
        chunkOverlap: body.chunkOverlap || 50,
        tags: body.tags || [],
        settings: body.settings || {},
        documentCount: 0,
        totalSize: 0,
      })
      .returning();

    return NextResponse.json(newDataset, { status: 201 });
  } catch (error) {
    console.error('Error creating dataset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
