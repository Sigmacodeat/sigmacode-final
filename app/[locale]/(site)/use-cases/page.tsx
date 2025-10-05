import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import UseCaseCard from './components/UseCaseCard';
import { USE_CASES } from './useCasesV2';

export const metadata: Metadata = {
  title: 'Use Cases – Firewall‑Powered Agents, Workflows & MAS',
  description:
    'Detaillierte Use Cases für SIGMACODE AI: Firewall‑gesicherte Agenten, PII‑Redaction, Compliance‑Research, Workflow‑Automation und mehr – mit Shadow/Enforce, Audit‑Logs und RBAC.',
  alternates: { canonical: '/use-cases' },
  openGraph: {
    title: 'Use Cases – SIGMACODE AI',
    description:
      'Enterprise‑taugliche AI Use Cases: Security‑First, Audit‑fähig, Shadow/Enforce‑Firewall, Workflows & MAS.',
    url: '/use-cases',
  },
};

export default function UseCasesIndexPage({ params }: { params: { locale: string } }) {
  const groups: {
    id: string;
    title: string;
    categories: Array<(typeof USE_CASES)[number]['category']>;
  }[] = [
    { id: 'security', title: 'Security', categories: ['security'] },
    { id: 'compliance', title: 'Compliance', categories: ['compliance'] },
    { id: 'workflows', title: 'Workflows', categories: ['workflow'] },
    {
      id: 'industries',
      title: 'Industries',
      categories: ['healthcare', 'finance', 'gov', 'pharma', 'infrastructure'],
    },
    { id: 'support-ops', title: 'Support & Ops', categories: ['support', 'it'] },
    { id: 'business', title: 'Business', categories: ['sales', 'marketing', 'hr', 'legal'] },
    { id: 'research', title: 'Research', categories: ['research'] },
    { id: 'multi-agent', title: 'Multi‑Agent', categories: ['multi-agent'] },
  ];

  const grouped = groups
    .map((g) => ({
      ...g,
      items: USE_CASES.filter((u) => g.categories.includes(u.category)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>
          Use Cases
        </h1>
        <p className="mt-3 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
          Lösungen und Branchen‑Szenarien – Security‑First mit Shadow/Enforce‑Firewall, Audit‑Logs
          und RBAC.
        </p>
      </header>

      {/* Sprungnavigation für Barrierefreiheit */}
      <nav aria-label="Use‑Case Abschnitte" className="sr-only not-sr-only md:sr-only">
        <ul className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {grouped.map((g) => (
            <li key={g.id}>
              <a href={`#${g.id}`} className="underline-offset-4 hover:underline">
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Gruppierte, einspaltige Abschnitte */}
      <div className="mt-6 space-y-8">
        {grouped.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-20">
            <h2
              id={`${g.id}-title`}
              className="text-sm font-semibold tracking-wide uppercase text-[color:var(--muted-foreground)] mb-3"
            >
              {g.title}
            </h2>
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
              {g.items.map(({ icon, ...item }) => (
                <Reveal key={item.href}>
                  <div className="py-3">
                    <UseCaseCard item={item} />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-end">
        <Link
          href={`/${params.locale}/workflows`}
          className="text-sm underline-offset-4 hover:underline"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Zu Workflows
        </Link>
      </div>

      <section className="prose dark:prose-invert max-w-none mt-10">
        <h2>Was macht unsere Use Cases SEO‑stark?</h2>
        <ul>
          <li>Konkrete Metriken (CSAT, Handle‑Time, Overhead, Policy‑Hits)</li>
          <li>Technische Tiefe (Shadow/Enforce, PII‑Redaction, Kong Gateway)</li>
          <li>Interne Verlinkung auf Produktseiten (Agents, Firewall, Workflows)</li>
          <li>FAQ‑Abschnitte und klare CTAs</li>
          <li>Enterprise‑Features (RBAC, Audit, Compliance) klar hervorgehoben</li>
        </ul>
      </section>
    </main>
  );
}
