export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const PostBodySchema = z.object({
  force: z.boolean().optional(),
  sources: z.array(z.enum(['community', 'commercial', 'custom', 'all'])).optional(),
});

// This route intentionally avoids DB; tests mock SignatureService instead

export async function GET(_request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getServerSession } = require('next-auth');
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SignatureService } = require('@/lib/signature-service');
    const svc = SignatureService.getInstance();
    const stats = await svc.getSignatureStats?.();
    return NextResponse.json({ stats }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Auth required and admin role enforced
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getServerSession } = require('next-auth');
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse JSON safely to return 400 on malformed input
    let json: any;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json({ error: 'Bad Request: missing body' }, { status: 400 });
      }
      json = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: 'Bad Request: malformed JSON' }, { status: 400 });
    }

    const parsed = PostBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SignatureService } = require('@/lib/signature-service');
    const svc = SignatureService.getInstance();
    const result = await svc.syncSignatures({
      force: parsed.data.force ?? false,
      sources: parsed.data.sources ?? undefined,
    });

    return NextResponse.json(
      { success: true, message: 'Signature sync completed', result },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
