import { NextResponse } from 'next/server';

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export async function POST(req: Request) {
  try {
    const raw: unknown = await req.json().catch(() => ({}));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json(
        { ok: false, error: 'Request body must be a JSON object' },
        { status: 400 },
      );
    }
    const {
      name: _name,
      email: _email,
      company: _company,
      message: _message,
    } = raw as {
      name?: string;
      email?: string;
      company?: string;
      message?: string;
    };
    const name = String(_name || '').trim();
    const email = String(_email || '').trim();
    const company = String(_company || '').trim();
    const message = String(_message || '').trim();

    if (!name || !message || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'Validation failed' }, { status: 400 });
    }

    // TODO: Hook for email/CRM integration (e.g., Resend, Sendgrid, HubSpot)
    console.log('[contact] lead', {
      name,
      email,
      company,
      messageLength: message.length,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
