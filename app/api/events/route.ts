import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Initial hello event
      send('hello', { message: 'SSE connected', ts: Date.now() });

      const interval = setInterval(() => {
        send('heartbeat', { ts: Date.now() });
      }, 25000);

      // Demo notifications every 15s
      const demo = setInterval(() => {
        send('notification', {
          id: `${Date.now()}`,
          type: 'info',
          title: 'Background job finished',
          message: 'A periodic task has completed successfully.',
          createdAt: new Date().toISOString(),
        });
      }, 15000);

      const close = () => {
        clearInterval(interval);
        clearInterval(demo);
        controller.close();
      };

      // @ts-ignore: not available in edge runtime
      _req.signal?.addEventListener('abort', close);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
