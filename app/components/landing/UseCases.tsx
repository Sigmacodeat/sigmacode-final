import { Reveal } from '@/components/ui/Reveal';
import ThemedCard from '@/components/ui/ThemedCard';
import { USE_CASES } from '@/app/[locale]/(site)/use-cases/useCases';
import { getUseCaseBySlug, type UseCaseTheme } from '@/app/lib/use-case-themes';

// Mappe Kategorien/Slugs auf das vereinheitlichte Theme-System
function resolveTheme(slug: string, category?: string): UseCaseTheme {
  const bySlug = getUseCaseBySlug(slug);
  if (bySlug) return bySlug;
  const map: Record<string, UseCaseTheme> = {
    gov: 'government',
    government: 'government',
    security: 'security',
    compliance: 'compliance',
    infrastructure: 'infrastructure',
    finance: 'finance',
    healthcare: 'healthcare',
    pharma: 'pharma',
    workflow: 'workflow',
    // sinnvolle Defaults
    support: 'workflow',
    research: 'workflow',
    'multi-agent': 'workflow',
  };
  return map[category ?? ''] ?? 'workflow';
}

export function UseCases() {
  // Fallback-Titel/ID falls central content nicht existiert
  const sectionId = 'use-cases';
  const sectionTitle = 'Use Cases';

  return (
    <section id={sectionId} className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
        {sectionTitle}
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map((u, i) => (
          <Reveal key={u.slug} delayMs={i * 70}>
            <ThemedCard
              tone={(() => {
                const t = resolveTheme(u.slug, u.category as string);
                // Map UseCaseTheme -> ThemedTone
                const map: Record<
                  string,
                  'firewall' | 'agents' | 'robotics' | 'appstore' | 'success' | 'danger' | 'brand'
                > = {
                  government: 'brand',
                  security: 'firewall',
                  compliance: 'success',
                  infrastructure: 'danger',
                  finance: 'brand',
                  healthcare: 'success',
                  pharma: 'success',
                  workflow: 'agents',
                };
                return map[t] ?? 'brand';
              })()}
              title={u.title}
              description={u.excerpt}
              href={u.href}
              kpis={u.kpis?.length ? [u.kpis[0]] : undefined}
              showSecurity={true}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
