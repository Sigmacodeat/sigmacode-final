import * as Sentry from '@sentry/nextjs';

// Next.js App Router instrumentation for server/edge
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV,
    enabled: !!process.env.SENTRY_DSN,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
}
