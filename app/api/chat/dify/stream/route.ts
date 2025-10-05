import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Deprecated: Dieser Streaming-Endpunkt wurde durch SIGMACODE AI ersetzt.
// Leitet permanent auf den neuen Streaming-Endpoint um.
export async function POST(_req: NextRequest) {
  return new Response(null, {
    status: 308,
    headers: {
      Location: '/api/sigmacode-ai/stream',
      'X-Deprecated': 'Use /api/sigmacode-ai/stream',
    },
  });
}
