'use client';
import * as Sentry from '@sentry/nextjs';

// Client-seitige Instrumentation (Turbopack-kompatibel)
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV,
    enabled: !!(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    // Optional: Session Replay auf dem Client
    replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0.0),
    replaysOnErrorSampleRate: Number(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? 1.0),
  });
}
