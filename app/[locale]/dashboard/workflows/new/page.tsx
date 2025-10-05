/**
 * SIGMACODE AI - New Workflow Page (Server)
 * - Stellt SEO-Metadaten via generateMetadata bereit
 * - Rendert die Client-Komponente
 */

import type { Metadata } from 'next';
import { env } from '@/env.mjs';
import NewWorkflowPageClient from './NewWorkflowPageClient';

function absoluteUrl(path: string) {
  const base = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params?.locale || 'de';
  const title = 'Neuer Workflow – SIGMACODE Neural Firewall';
  const description =
    'Erstelle neue AI‑Workflows mit Firewall‑Schutz. Shadow → Enforce, Audit‑Logs und sub‑100ms Performance.';
  const canonical = absoluteUrl(`/${locale}/dashboard/workflows/new`);

  const ogImage = absoluteUrl('/logo/sigmacode-ai-og.png');

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'SIGMACODE Neural Firewall',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'SIGMACODE Neural Firewall' }],
      type: 'website',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@sigmacode_ai',
    },
  } satisfies Metadata;
}

export default function Page() {
  return <NewWorkflowPageClient />;
}
