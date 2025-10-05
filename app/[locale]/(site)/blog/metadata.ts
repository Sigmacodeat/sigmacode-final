import type { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
  return {
    title: 'Blog – Security‑First AI Insights, Case Studies & Updates',
    description:
      'Der SIGMACODE AI Blog: Security‑First Best Practices, AI‑Firewall, Compliance, Use Cases und Produkt‑Updates.',
    alternates: { canonical: '/blog' },
    openGraph: {
      title: 'Blog – SIGMACODE AI',
      description:
        'Insights zu AI‑Sicherheit, Firewall‑Guardrails, Compliance und Enterprise‑Workflows.',
      url: '/blog',
    },
  };
};
