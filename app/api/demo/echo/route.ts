import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const raw: unknown = await req.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json(
        { ok: false, error: 'Request body must be a JSON object' },
        { status: 400 },
      );
    }
    const { prompt, mode } = raw as { prompt?: unknown; mode?: 'shadow' | 'enforce' };
    // Simuliere Policy-Entscheidung
    const blocked = typeof prompt === 'string' && /secret|password|pii|iban|ssn/i.test(prompt);
    const latency = Math.floor(20 + Math.random() * 60); // 20-80ms

    // Shadow: blockiert nicht, aber markiert; Enforce: blockiert mit Hinweis
    const policy: 'allow' | 'block' | 'shadow-block' = blocked
      ? mode === 'enforce'
        ? 'block'
        : 'shadow-block'
      : 'allow';

    let output = '';
    if (policy === 'block') {
      output =
        'Antwort blockiert durch Firewall‑Policy (PII/Policy Treffer). Bitte Prompt anpassen.';
    } else {
      output = `Echo: ${typeof prompt === 'string' ? prompt : ''}\n\n(Policy: ${policy}, ~${latency}ms)`;
    }

    return NextResponse.json({ ok: true, output, policy, latency });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
