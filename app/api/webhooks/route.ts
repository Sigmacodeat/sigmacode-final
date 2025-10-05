import { NextRequest, NextResponse } from 'next/server';
import { webhookService, type AlertType, type AlertSeverity } from '@/lib/webhook-service';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

const CreateWebhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  method: z.enum(['POST', 'PUT', 'PATCH']).default('POST'),
  headers: z.record(z.string()).optional(),
  retryPolicy: z
    .object({
      maxRetries: z.number().min(0).max(10).default(3),
      backoffMultiplier: z.number().min(1).max(5).default(2),
      initialDelay: z.number().min(100).max(60000).default(1000),
    })
    .optional(),
  rateLimit: z
    .object({
      maxPerMinute: z.number().min(1).max(1000).default(60),
      maxPerHour: z.number().min(1).max(10000).default(1000),
    })
    .optional(),
  filters: z
    .object({
      alertTypes: z
        .array(
          z.enum([
            'firewall_block',
            'firewall_threat',
            'firewall_error',
            'policy_violation',
            'rate_limit_exceeded',
            'suspicious_activity',
            'system_error',
            'config_change',
            'user_action',
            'security_incident',
          ]),
        )
        .optional(),
      minSeverity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      includeRawData: z.boolean().default(false),
    })
    .optional(),
});

// POST /api/webhooks - Create webhook configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateWebhookSchema.parse(body);

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    const webhook = await webhookService.createWebhookConfig({
      tenantId,
      name: validatedData.name,
      url: validatedData.url,
      method: validatedData.method,
      headers: validatedData.headers,
      enabled: true,
      retryPolicy: validatedData.retryPolicy,
      rateLimit: validatedData.rateLimit,
      filters: validatedData.filters,
    });

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhook.id,
        tenantId: webhook.tenantId,
        name: webhook.name,
        url: webhook.url,
        method: webhook.method,
        enabled: webhook.enabled,
        retryPolicy: webhook.retryPolicy,
        rateLimit: webhook.rateLimit,
        filters: webhook.filters,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    const requestId = request.headers.get('x-request-id') || 'unknown';
    Sentry.withScope((scope) => {
      scope.setTag('route', 'POST /api/webhooks');
      scope.setTag('feature', 'webhooks');
      scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
    console.error('Create webhook error:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    res.headers.set('x-request-id', requestId);
    return res;
  }
}

// GET /api/webhooks - Get webhook configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const webhooks = await webhookService.getWebhooksForTenant(tenantId);

    // Remove sensitive data
    const sanitizedWebhooks = webhooks.map((webhook) => ({
      id: webhook.id,
      tenantId: webhook.tenantId,
      name: webhook.name,
      url: webhook.url,
      method: webhook.method,
      enabled: webhook.enabled,
      retryPolicy: webhook.retryPolicy,
      rateLimit: webhook.rateLimit,
      filters: webhook.filters,
      createdAt: webhook.createdAt,
      updatedAt: webhook.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      webhooks: sanitizedWebhooks,
    });
  } catch (error: unknown) {
    const requestId = request.headers.get('x-request-id') || 'unknown';
    Sentry.withScope((scope) => {
      scope.setTag('route', 'GET /api/webhooks');
      scope.setTag('feature', 'webhooks');
      scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
    console.error('Get webhooks error:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    res.headers.set('x-request-id', requestId);
    return res;
  }
}

// POST /api/webhooks/test - Send test alert to webhook
export async function PUT(request: NextRequest) {
  try {
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const { webhookId } = raw as { webhookId?: string };

    if (!webhookId) {
      return NextResponse.json({ error: 'webhookId is required' }, { status: 400 });
    }

    await webhookService.sendTestAlert(webhookId);

    return NextResponse.json({
      success: true,
      message: 'Test alert sent successfully',
    });
  } catch (error: unknown) {
    const requestId = request.headers.get('x-request-id') || 'unknown';
    Sentry.withScope((scope) => {
      scope.setTag('route', 'PUT /api/webhooks/test');
      scope.setTag('feature', 'webhooks');
      scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
    console.error('Send test alert error:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    res.headers.set('x-request-id', requestId);
    return res;
  }
}

// POST /api/alerts - Send custom alert
export async function PATCH(request: NextRequest) {
  try {
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const {
      tenantId,
      type,
      severity,
      title,
      message,
      data = {},
      userId,
      sessionId,
      ipAddress,
      userAgent,
    } = raw as {
      tenantId?: string;
      type?: string;
      severity?: string;
      title?: string;
      message?: string;
      data?: Record<string, unknown>;
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
    };

    if (!tenantId || !type || !severity || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await webhookService.sendSystemAlert(
      tenantId,
      type as AlertType,
      severity as AlertSeverity,
      title,
      message,
      {
        ...data,
        userId,
        sessionId,
        ipAddress,
        userAgent,
      },
    );

    return NextResponse.json({
      success: true,
      message: 'Alert sent successfully',
    });
  } catch (error: unknown) {
    const requestId = request.headers.get('x-request-id') || 'unknown';
    Sentry.withScope((scope) => {
      scope.setTag('route', 'PATCH /api/webhooks/alerts');
      scope.setTag('feature', 'webhooks');
      scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
    console.error('Send alert error:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    res.headers.set('x-request-id', requestId);
    return res;
  }
}
