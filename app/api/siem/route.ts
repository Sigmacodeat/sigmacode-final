import { NextRequest, NextResponse } from 'next/server';
import { siemService } from '@/lib/siem-service';
import { z } from 'zod';

const CreateSIEMConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['splunk', 'elastic', 'datadog', 'webhook', 'syslog']),
  config: z.record(z.any()),
  filters: z
    .object({
      minSeverity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      eventTypes: z.array(z.string()).optional(),
      includeRawLogs: z.boolean().optional(),
    })
    .optional(),
});

// POST /api/siem/config - Create SIEM configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateSIEMConfigSchema.parse(body);

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    const config = await siemService.createSIEMConfig({
      tenantId,
      name: validatedData.name,
      type: validatedData.type,
      enabled: true,
      config: validatedData.config,
      filters: validatedData.filters,
    });

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        tenantId: config.tenantId,
        name: config.name,
        type: config.type,
        enabled: config.enabled,
        config: config.config,
        filters: config.filters,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Create SIEM config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/siem/config - Get SIEM configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const configs = await siemService.getSIEMConfigs(tenantId);

    // Remove sensitive data
    const sanitizedConfigs = configs.map((config) => ({
      id: config.id,
      tenantId: config.tenantId,
      name: config.name,
      type: config.type,
      enabled: config.enabled,
      filters: config.filters,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      configs: sanitizedConfigs,
    });
  } catch (error: unknown) {
    console.error('Get SIEM configs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/siem/test - Test SIEM configuration
export async function PUT(request: NextRequest) {
  try {
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const { configId, testEvent } = raw as { configId?: string; testEvent?: any };

    if (!configId) {
      return NextResponse.json({ error: 'configId is required' }, { status: 400 });
    }

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    // Get config
    const configs = await siemService.getSIEMConfigs(tenantId);
    const config = configs.find((c) => c.id === configId);

    if (!config) {
      return NextResponse.json({ error: 'SIEM configuration not found' }, { status: 404 });
    }

    // Create test event
    const testEventData = testEvent || {
      id: `test_${Date.now()}`,
      timestamp: new Date(),
      tenantId,
      eventType: 'siem_test',
      severity: 'medium',
      source: 'firewall',
      message: 'Test event from SIGMACODE Firewall',
      data: { test: true },
      tags: ['test'],
    };

    // Send test event
    await siemService.sendEvent(config, testEventData);

    return NextResponse.json({
      success: true,
      message: 'Test event sent successfully',
    });
  } catch (error: unknown) {
    console.error('Test SIEM config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
