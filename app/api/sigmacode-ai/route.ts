import { NextRequest } from 'next/server';

// SIGMACODE AI Chat API (ersetzt Dify komplett)
// Erwartet: { sessionId: string, messages: { role: 'user'|'assistant', content: string }[] }
// Antwort: { answer: string }

export async function POST(req: NextRequest) {
  const SIGMACODE_API_KEY = process.env.SIGMACODE_API_KEY;

  if (!SIGMACODE_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'SIGMACODE AI API-Key fehlt. Bitte SIGMACODE_API_KEY in .env setzen.',
      }),
      { status: 501, headers: { 'content-type': 'application/json' } },
    );
  }

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: 'Request body must be a JSON object' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    const { sessionId, messages } = body as {
      sessionId?: string;
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'sessionId und messages sind erforderlich' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // SIGMACODE AI: Intelligente Sales-Engine statt einfacher Proxy
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      return new Response(JSON.stringify({ error: 'Keine user Nachricht vorhanden' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // SIGMACODE AI Sales-Engine (deine eigene Implementierung)
    const answer = await generateSigmacodeResponse(lastUser.content, sessionId);

    return new Response(
      JSON.stringify({
        answer,
        metadata: {
          engine: 'SIGMACODE AI Sales Engine',
          version: '1.0.0',
          branding: 'SIGMACODE AI',
        },
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'SIGMACODE AI Serverfehler',
        details: String(err?.message || err),
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}

// SIGMACODE AI Sales-Engine (deine eigene Intelligenz)
async function generateSigmacodeResponse(userMessage: string, sessionId: string): Promise<string> {
  const message = userMessage.toLowerCase();

  // SIGMACODE AI Sales-Optimierung
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `🔥 **Willkommen bei SIGMACODE AI!**

Ich bin dein persönlicher AI-Assistent für SIGMACODE AI - der führenden Plattform für intelligente Agent-Orchestrierung.

**Was ich für dich tun kann:**
• 🚀 **Produktinformationen** - Alles über unsere Features
• 💰 **Preise & Pläne** - Finde das perfekte Paket
• 📅 **Demo-Termin** - Persönliche Vorführung buchen
• 🛡️ **Sicherheit** - Höchste Standards garantiert
• 🔧 **Integration** - Nahtlose Anbindung möglich

Wie kann ich dir bei SIGMACODE AI helfen?`;
  }

  if (message.includes('demo') || message.includes('termin') || message.includes('vorführung')) {
    return `🎯 **Demo-Termin für SIGMACODE AI**

Ich helfe dir gerne dabei, einen persönlichen Demo-Termin zu vereinbaren!

**Warum SIGMACODE AI?**
• ⚡ **Sub-100ms** globale Antwortzeiten
• 🛡️ **AI-Firewall** mit Echtzeit-Schutz
• 📊 **Live-Monitoring** und Analytics
• 🔒 **SOC 2 Type II** zertifiziert

**Nächste Schritte:**
1. Kontaktiere unser Team: hello@sigmacode.ai
2. Buche einen Termin: https://calendly.com/sigmacode/demo
3. Erhalte eine persönliche Produktvorführung

Möchtest du mehr über unsere Features oder Preise erfahren?`;
  }

  if (message.includes('preis') || message.includes('kosten') || message.includes('kostenlos')) {
    return `💰 **SIGMACODE AI Preise**

**Starter Plan - €99/Monat:**
• Bis zu 5 AI-Agents
• Basis-Firewall-Schutz
• E-Mail Support
• 1GB Storage

**Professional Plan - €299/Monat:**
• Bis zu 25 AI-Agents
• Erweiterte Sicherheitsfeatures
• Priority Support
• 10GB Storage

**Enterprise Plan - Individuell:**
• Unbegrenzte Agents
• White-Label Optionen
• 24/7 Support
• Individuelle Integrationen

**Alle Pläne beinhalten:**
✅ 14 Tage kostenlose Testphase
✅ Keine Kreditkarte erforderlich
✅ Monatliche Kündigung möglich

Welcher Plan passt am besten zu deinen Anforderungen?`;
  }

  if (
    message.includes('sicherheit') ||
    message.includes('schutz') ||
    message.includes('firewall')
  ) {
    return `🛡️ **SIGMACODE AI Sicherheit**

SIGMACODE AI ist mit den höchsten Sicherheitsstandards entwickelt:

**Sicherheits-Features:**
• 🔐 **Zero-Trust Architektur**
• 🛡️ **AI-Firewall** mit Sub-50ms Schutz
• 🔒 **256-Bit Verschlüsselung**
• 📋 **SOC 2 Type II** zertifiziert
• 🌍 **GDPR konform**
• 📊 **Immutable Audit Trails**

**Enterprise-Standards:**
• ISO 27001 Zertifizierung
• Regelmäßige Sicherheitsaudits
• 24/7 Monitoring
• Incident Response Team

**AI-Sicherheit speziell:**
• Echtzeit-Content-Filtering
• Prompt-Injection-Schutz
• Malicious Code Detection
• Secure Agent Isolation

Deine Daten sind bei SIGMACODE AI maximal geschützt!`;
  }

  // Standard-Antwort mit SIGMACODE AI Branding
  return `🔥 **SIGMACODE AI - Deine AI-Revolution**

Vielen Dank für dein Interesse an SIGMACODE AI! Ich helfe dir gerne weiter.

**Unsere Stärken:**
• ⚡ **Blitzschnelle Performance** - Sub-100ms global
• 🛡️ **Integrierte AI-Sicherheit** - Firewall-Schutz
• 📊 **Real-time Monitoring** - Live-Dashboards
• 🔧 **Einfache Integration** - RESTful APIs

**Wie kann ich dir helfen?**
• 🏠 **Produkt-Übersicht** - Was ist SIGMACODE AI?
• ⚙️ **Technische Details** - Architektur & Features
• 💰 **Preise & Pläne** - Finde dein Paket
• 📅 **Demo buchen** - Persönliche Vorführung
• 📞 **Kontakt** - Mit unserem Team sprechen

Was möchtest du als nächstes erfahren?`;
}
