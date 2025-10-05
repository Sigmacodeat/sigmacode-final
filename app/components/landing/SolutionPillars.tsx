import { pillars } from '@/content/landing';
import ThemedCard from '@/components/ui/ThemedCard';

export function SolutionPillars() {
  return (
    <section id={pillars.id} className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
        {pillars.title}
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {pillars.steps.map((s) => (
          <ThemedCard key={s.step} tone="brand" showSecurity={false} innerClassName="p-6">
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {s.step}
            </div>
            <div className="mt-1 text-lg font-semibold" style={{ color: 'var(--fg)' }}>
              {s.title}
            </div>
            <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
              {s.desc}
            </p>
          </ThemedCard>
        ))}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {pillars.values.map((v) => (
          <ThemedCard
            key={v.title}
            tone="brand"
            showSecurity={false}
            innerClassName="p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
              {v.title}
            </h3>
            <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
              {v.desc}
            </p>
          </ThemedCard>
        ))}
      </div>
      <p className="mt-6 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {pillars.flowNote}
      </p>
    </section>
  );
}
