import { http, HttpResponse, delay } from 'msw';

export interface HandlerOptions {
  delayMs?: number;
  fixedNow?: string; // Stabiler Zeitstempel für Snapshot-Tests
}

export const createHandlers = (opts: HandlerOptions = {}) => {
  const { delayMs = 0, fixedNow } = opts;
  const now = fixedNow ?? new Date().toISOString();

  return [
    // AutoOptimizer endpoints
    http.get('/api/bundle-info', async ({ request }) => {
      // Fehler-Simulation via Query-Param: /api/bundle-info?fail=1
      const url = new URL(request.url);
      if (delayMs) await delay(delayMs);
      if (url.searchParams.get('fail') === '1') {
        return HttpResponse.json({ error: 'bundles_unavailable' }, { status: 500 });
      }
      return HttpResponse.json({ size: 123456, generatedAt: now }, { status: 200 });
    }),

    http.get('/api/cache-stats', async ({ request }) => {
      const url = new URL(request.url);
      if (delayMs) await delay(delayMs);
      if (url.searchParams.get('fail') === '1') {
        return HttpResponse.json({ error: 'cache_stats_unavailable' }, { status: 503 });
      }
      return HttpResponse.json({ hitRate: 0.87, generatedAt: now }, { status: 200 });
    }),
  ];
};

// Kompatibilitätsexport für bestehende Importe in mswServer.ts
export const handlers = createHandlers();

// Default-Export mit Standard-Optionen
export default createHandlers();
