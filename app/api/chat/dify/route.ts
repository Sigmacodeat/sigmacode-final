import { NextRequest } from 'next/server';

// Deprecated: Dieser Endpunkt wurde durch SIGMACODE AI ersetzt.
// Leitet permanent auf den neuen Endpoint um, damit alte Clients weiter funktionieren.
export async function POST(_req: NextRequest) {
  return new Response(null, {
    status: 308,
    headers: {
      Location: '/api/sigmacode-ai',
      'X-Deprecated': 'Use /api/sigmacode-ai',
    },
  });
}
