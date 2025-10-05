import { workflow } from '@/content/landing';
import ThemedCard from '@/components/ui/ThemedCard';

export function Workflow() {
  return (
    <section id={workflow.id} className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {workflow.title}
          </h2>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
            {workflow.sub}
          </p>
        </div>
        <a
          href="#try"
          className="hidden rounded-lg px-4 py-2 text-sm transition-colors md:inline-block"
          style={{
            backgroundColor: 'var(--brand)',
            color: 'var(--brand-foreground)',
          }}
        >
          Templates ansehen
        </a>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {workflow.steps.map((s) => (
          <ThemedCard
            key={s.title}
            tone="brand"
            showSecurity={false}
            innerClassName="p-6 h-full"
            className="hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
              {s.title}
            </div>
            <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
              {s.desc}
            </p>
          </ThemedCard>
        ))}
      </div>
    </section>
  );
}
