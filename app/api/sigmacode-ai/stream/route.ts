import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).slice(2);
  const startedAt = Date.now();
  const SIGMACODE_API_KEY = process.env.SIGMACODE_API_KEY;

  if (!SIGMACODE_API_KEY) {
    return new Response('data: {"error":"SIGMACODE AI API-Key fehlt"}\n\n', {
      status: 501,
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
      },
    });
  }

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return new Response('data: {"error":"Request body must be a JSON object"}\n\n', {
        status: 400,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      });
    }
    const { sessionId, messages } = body as {
      sessionId?: string;
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };
    if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
      return new Response('data: {"error":"sessionId und messages sind erforderlich"}\n\n', {
        status: 400,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      return new Response('data: {"error":"Keine user Nachricht vorhanden"}\n\n', {
        status: 400,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // SIGMACODE AI Streaming Response
    (async () => {
      try {
        const fullResponse = await generateSigmacodeStreamingResponse(lastUser.content, sessionId);

        // Stream the response in chunks
        const chunks = fullResponse.split(' ');
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          await writer.write(encoder.encode(`data: {"content":"${chunk} "}\n\n`));
          // Small delay for streaming effect
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Emit completion metadata
        const latency = Date.now() - startedAt;
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              metadata: {
                requestId,
                latencyMs: latency,
                engine: 'SIGMACODE AI Streaming Engine',
                version: '1.0.0',
              },
              finished: true,
            })}\n\n`,
          ),
        );
      } catch (e) {
        await writer.write(
          encoder.encode(
            `data: {"error":"SIGMACODE AI Stream-Fehler","details":"${String((e as any)?.message || e)}"}\n\n`,
          ),
        );
      } finally {
        try {
          await writer.close();
        } catch {}
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-engine': 'SIGMACODE AI Streaming',
        'x-request-id': requestId,
      },
    });
  } catch (err: any) {
    return new Response(
      `data: {"error":"SIGMACODE AI Serverfehler","details":"${String(err?.message || err)}"}\n\n`,
      {
        status: 500,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      },
    );
  }
}

// SIGMACODE AI Streaming Engine
async function generateSigmacodeStreamingResponse(
  userMessage: string,
  sessionId: string,
): Promise<string> {
  const message = userMessage.toLowerCase();

  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return '🔥 Willkommen bei SIGMACODE AI! Ich bin dein persönlicher AI-Assistent für die führende Plattform für intelligente Agent-Orchestrierung. Mit unserer AI-Firewall und Echtzeit-Monitoring revolutionieren wir die Art, wie Unternehmen KI einsetzen. Wie kann ich dir helfen, mehr über unsere Features, Preise oder eine Demo zu erfahren?';
  }

  if (message.includes('demo') || message.includes('termin') || message.includes('vorführung')) {
    return '🎯 Demo-Termin für SIGMACODE AI - Ich helfe dir gerne dabei, einen persönlichen Demo-Termin zu vereinbaren! Unsere Plattform bietet einzigartige Features wie Sub-100ms globale Antwortzeiten, integrierte AI-Sicherheit und Live-Monitoring. Kontaktiere unser Team unter hello@sigmacode.ai oder buche direkt einen Termin über unser Calendly. Möchtest du mehr über unsere Sicherheitsfeatures oder Preise erfahren?';
  }

  if (message.includes('preis') || message.includes('kosten') || message.includes('kostenlos')) {
    return '💰 SIGMACODE AI Preise - Starter Plan €99/Monat (bis zu 5 AI-Agents, Basis-Firewall, E-Mail Support), Professional Plan €299/Monat (bis zu 25 AI-Agents, erweiterte Sicherheit, Priority Support), Enterprise Plan individuell (unbegrenzte Agents, White-Label, 24/7 Support). Alle Pläne beinhalten 14 Tage kostenlose Testphase ohne Kreditkarte. Welcher Plan passt am besten zu deinen Anforderungen?';
  }

  if (
    message.includes('sicherheit') ||
    message.includes('schutz') ||
    message.includes('firewall')
  ) {
    return '🛡️ SIGMACODE AI Sicherheit - Zero-Trust Architektur, 256-Bit Verschlüsselung, SOC 2 Type II zertifiziert, GDPR konform, AI-Firewall mit Sub-50ms Schutz, Immutable Audit Trails, ISO 27001 Zertifizierung, 24/7 Monitoring, Incident Response Team. Deine Daten sind bei SIGMACODE AI maximal geschützt mit höchsten Sicherheitsstandards der Branche.';
  }

  return '🔥 SIGMACODE AI - Deine AI-Revolution! Vielen Dank für dein Interesse an unserer Plattform. Wir bieten blitzschnelle Performance mit Sub-100ms globalen Antwortzeiten, integrierte AI-Sicherheit, Real-time Monitoring und einfache Integration über RESTful APIs. Wie kann ich dir helfen - möchtest du mehr über Features, Preise, eine Demo oder unsere Sicherheitsstandards erfahren?';
}
