import { NextRequest, NextResponse } from 'next/server';

// Basic POST endpoint for creating alerts
export async function POST(request: NextRequest) {
  try {
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json(
        { success: false, error: 'Request body must be a JSON object' },
        { status: 400 },
      );
    }
    const body = raw as { tenantId?: string; title?: string; message?: string } & Record<
      string,
      unknown
    >;

    // Basic validation
    if (!body.tenantId || !body.title || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tenantId, title, message' },
        { status: 400 },
      );
    }

    // This would typically insert into database
    // For now, return mock response
    const newAlert = {
      id: `alert-${Date.now()}`,
      ...(body as Record<string, unknown>),
      status: 'new',
      triggeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        alert: newAlert,
        message: 'Alert created successfully',
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('Create alert error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Basic GET endpoint for retrieving alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId parameter is required' },
        { status: 400 },
      );
    }

    // This would typically fetch from database
    // For now, return mock data
    const alerts = [
      {
        id: 'alert-1',
        title: 'High CPU Usage',
        message: 'CPU usage has exceeded 90%',
        severity: 'high',
        category: 'performance_issue',
        status: 'new',
        tenantId: tenantId,
        triggeredAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      alerts,
      total: alerts.length,
    });
  } catch (error: unknown) {
    console.error('Get alerts error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Basic PUT endpoint for updating alerts
export async function PUT(request: NextRequest) {
  try {
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json(
        { success: false, error: 'Request body must be a JSON object' },
        { status: 400 },
      );
    }
    const body = raw as { id?: string } & Record<string, unknown>;

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    // This would typically update the database
    // For now, return mock response
    const updatedAlert = {
      id: body.id!,
      ...(body as Record<string, unknown>),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
      message: 'Alert updated successfully',
    });
  } catch (error: unknown) {
    console.error('Update alert error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Basic DELETE endpoint for deleting alerts
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id parameter is required' },
        { status: 400 },
      );
    }

    // This would typically delete from database
    // For now, return mock response
    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
      id,
    });
  } catch (error: unknown) {
    console.error('Delete alert error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
