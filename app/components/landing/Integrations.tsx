import { integrations } from '@/content/landing';
import ThemedCard from '@/components/ui/ThemedCard';
import { Reveal } from '@/components/ui/Reveal';

export function Integrations() {
  return (
    <section id={integrations.id} className="mx-auto max-w-6xl px-6 py-14">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
        {integrations.title}
      </h2>
      <div className="mt-6 grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 md:grid-cols-6">
        {integrations.items.map((it, idx) => (
          <Reveal key={it.name} delayMs={idx * 50}>
            <ThemedCard
              tone="brand"
              showSecurity={false}
              innerClassName="p-4 text-center flex flex-col items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <img src={it.logo} alt={it.name} className="h-7 w-auto opacity-90" />
              <div className="text-xs font-medium" style={{ color: 'var(--fg)' }}>
                {it.name}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                {it.note}
              </div>
            </ThemedCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
