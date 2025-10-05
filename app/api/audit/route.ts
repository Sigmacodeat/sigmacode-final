import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/audit/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const status = searchParams.get('status') as any;
    const severity = searchParams.get('severity') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { events, total } = AuditLogger.getEvents({
      userId: userId || undefined,
      action: action || undefined,
      resource: resource || undefined,
      status: status || undefined,
      severity: severity || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Audit log retrieval error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    AuditLogger.clearEvents();
    return NextResponse.json({ success: true, message: 'All audit events cleared' });
  } catch (error: any) {
    console.error('Audit log clear error:', error);
    return NextResponse.json({ error: 'Failed to clear audit logs' }, { status: 500 });
  }
}
