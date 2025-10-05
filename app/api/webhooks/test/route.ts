import { NextRequest, NextResponse } from 'next/server';

// In-memory store for webhook deliveries (for demo). Replace with database in production.
let WEBHOOK_DELIVERIES: Array<{
  id: string;
  webhookId: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  payload: any;
  status: number;
  response?: string;
  timestamp: string;
  duration: number;
  error?: string;
}> = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const webhookId = searchParams.get('webhookId');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let filtered = [...WEBHOOK_DELIVERIES];

  if (webhookId) {
    filtered = filtered.filter((d) => d.webhookId === webhookId);
  }

  const paginated = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    deliveries: paginated,
    pagination: {
      total: filtered.length,
      limit,
      offset,
      hasMore: offset + limit < filtered.length,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookId, url, method = 'POST', headers = {}, payload = {} } = body;

    if (!webhookId || !url) {
      return NextResponse.json({ error: 'webhookId and url are required' }, { status: 400 });
    }

    const deliveryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startTime = Date.now();

    try {
      // Make the webhook request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SIGMACODE-AI-Webhook-Test/1.0',
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      const duration = Date.now() - startTime;

      const delivery = {
        id: deliveryId,
        webhookId,
        url,
        method,
        headers,
        payload,
        status: response.status,
        response: responseText,
        timestamp: new Date().toISOString(),
        duration,
      };

      WEBHOOK_DELIVERIES.push(delivery);

      return NextResponse.json({
        success: true,
        delivery,
        message: `Webhook test completed in ${duration}ms`,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;

      const delivery = {
        id: deliveryId,
        webhookId,
        url,
        method,
        headers,
        payload,
        status: 0,
        timestamp: new Date().toISOString(),
        duration,
        error: error.message,
      };

      WEBHOOK_DELIVERIES.push(delivery);

      return NextResponse.json({
        success: false,
        delivery,
        error: error.message,
        message: `Webhook test failed after ${duration}ms`,
      });
    }
  } catch (error: any) {
    console.error('Webhook test error:', error);
    return NextResponse.json({ error: 'Failed to test webhook' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deliveryId = searchParams.get('id');

  if (!deliveryId) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
  }

  const beforeCount = WEBHOOK_DELIVERIES.length;
  WEBHOOK_DELIVERIES = WEBHOOK_DELIVERIES.filter((d) => d.id !== deliveryId);
  const removed = beforeCount !== WEBHOOK_DELIVERIES.length;

  return NextResponse.json({
    success: removed,
    message: removed ? `Delivery ${deliveryId} removed` : 'Delivery not found',
  });
}
