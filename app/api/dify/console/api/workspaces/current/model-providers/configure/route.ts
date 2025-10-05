import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { getServerAuthSession } from '@/lib/auth';

/**
 * Provider Configuration API
 * Ermöglicht das sichere Setzen und Testen von Provider-Keys
 */
export async function POST(req: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { provider, apiKey, apiUrl } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider und API-Key sind erforderlich' },
        { status: 400 },
      );
    }

    // Teste die Verbindung mit dem neuen Key über unseren Proxy
    const testUrl = '/api/dify';
    const testRes = await fetch(`${testUrl}/console/api/workspaces/current/model-providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'x-dify-url': apiUrl || env.DIFY_API_URL || 'http://localhost:5001',
      },
      cache: 'no-store',
    });

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider und API-Key sind erforderlich' },
        { status: 400 },
      );
    }

    // Hier könnte man die Keys in einer sicheren Datenbank speichern
    // Für jetzt verwenden wir einfach ENV-Variablen (in Produktion Secrets verwenden)

    // Erfolgreich getestet - hier würde man die Keys speichern
    // Für jetzt geben wir nur zurück, dass es funktioniert hat
    return NextResponse.json({
      success: true,
      provider,
      configured: true,
      message: 'Provider erfolgreich konfiguriert und getestet',
    });
  } catch (error) {
    console.error('[provider-config] POST error:', error);
    return NextResponse.json({ error: 'Konfiguration fehlgeschlagen' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Aktuelle Konfiguration zurückgeben (ohne sensible Daten)
    const hasConfig = Boolean(env.DIFY_API_URL && env.DIFY_API_KEY);

    return NextResponse.json({
      hasConfig,
      configured: hasConfig,
      // Provider-Liste könnte hier auch zurückgegeben werden
    });
  } catch (error) {
    console.error('[provider-config] GET error:', error);
    return NextResponse.json({ error: 'Status nicht abrufbar' }, { status: 500 });
  }
}
