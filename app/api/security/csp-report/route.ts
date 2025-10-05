import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

// Zod-Schema für CSP Reports (tolerant gegenüber optionalen Feldern)
const CspReportSchema = z
  .object({
    documentURI: z.string().optional(),
    referrer: z.string().optional(),
    violatedDirective: z.string().optional(),
    effectiveDirective: z.string().optional(),
    originalPolicy: z.string().optional(),
    disposition: z.string().optional(),
    blockedURI: z.string().optional(),
    statusCode: z.number().optional(),
    scriptSample: z.string().optional(),
  })
  .strict()
  .partial();

// Unterstütze unterschiedliche Formate: legacy { 'csp-report': {...} },
// Reporting-API { type, body: {...} }, oder reines Objekt/Array von Reports
function extractReport(payload: unknown): Record<string, unknown> | null {
  if (!payload) return null;

  // Array von Reports (Reporting-API kann batched senden)
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0] as any;
    if (first && typeof first === 'object' && 'body' in first) {
      return (first as any).body ?? null;
    }
    return (first as any) ?? null;
  }

  // Legacy Schema { 'csp-report': {...} }
  if (typeof payload === 'object' && payload !== null && 'csp-report' in (payload as any)) {
    return (payload as any)['csp-report'] as Record<string, unknown>;
  }

  // Reporting-API einzelner Report { type, body }
  if (typeof payload === 'object' && payload !== null && 'body' in (payload as any)) {
    return (payload as any).body as Record<string, unknown>;
  }

  // Fallback: versuche direkt als Objekt zu interpretieren
  if (typeof payload === 'object' && payload !== null) {
    return payload as Record<string, unknown>;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch (parseError) {
      // 204 antworten, damit Browser nicht spammen, aber Hinweis loggen
      console.warn('CSP report: invalid JSON', parseError);
      return new NextResponse(null, { status: 204 });
    }

    const reportObj = extractReport(raw);
    if (!reportObj) {
      return new NextResponse(null, { status: 204 });
    }

    const parsed = CspReportSchema.safeParse(reportObj);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (!parsed.success) {
      // Schicke die Rohdaten trotzdem an Sentry als Hinweis
      Sentry.captureMessage('CSP report (invalid schema)', {
        level: 'warning',
        extra: { raw: reportObj, errors: parsed.error.flatten() },
        tags: { kind: 'csp-report', valid: 'no' },
      });
      return new NextResponse(null, { status: 204 });
    }

    const data = parsed.data;

    // An Sentry melden, mit hilfreichen Tags und Extras
    Sentry.captureMessage('CSP violation', {
      level: 'warning',
      tags: {
        kind: 'csp-report',
        effectiveDirective: String(data.effectiveDirective || ''),
        violatedDirective: String(data.violatedDirective || ''),
        blockedURI: String(data.blockedURI || ''),
      },
      extra: {
        report: data,
        userAgent,
        ip,
        receivedAt: new Date().toISOString(),
      },
    });

    // 204 No Content ist üblich für Report-Endpunkte
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Niemals Fehler an den Browser durchreichen, um Spam zu vermeiden
    console.error('Error processing CSP report:', error);
    return new NextResponse(null, { status: 204 });
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
