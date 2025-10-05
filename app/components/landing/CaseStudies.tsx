import { caseStudies } from '@/content/landing';
import { GlassCard, NeonButton } from '@/components/ui';
import { Reveal } from '@/components/ui/Reveal';

export function CaseStudies() {
  return (
    <section id={caseStudies.id} className="mx-auto max-w-6xl px-6 py-14">
      <h2 className="text-2xl font-bold">{caseStudies.title}</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {caseStudies.items.map((c, i) => (
          <Reveal key={c.title} delayMs={i * 90}>
            <article className="flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-zinc-900">
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {c.vertical}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{c.summary}</p>
              <ul className="mt-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {c.kpis.map((k, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                    {k}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <a
                  href="#contact"
                  className="text-sm font-medium text-brand-600 underline underline-offset-4 dark:text-brand-400"
                >
                  Mehr erfahren
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
