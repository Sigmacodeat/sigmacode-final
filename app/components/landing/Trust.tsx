import { trust } from '@/content/landing';
import ThemedCard from '@/components/ui/ThemedCard';

export function Trust() {
  return (
    <section id={trust.id} className="mx-auto max-w-6xl px-6 py-14">
      <h2
        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center"
        style={{ color: 'var(--fg)' }}
      >
        {trust.title}
      </h2>
      <div className="mx-auto mt-3 h-[2px] w-28 rounded-full bg-gradient-to-r from-[var(--brand-start)] via-[color-mix(in_oklab,var(--brand)_45%,transparent)] to-[var(--brand-end)] opacity-80" />
      <div className="mt-6 grid grid-cols-2 items-stretch gap-4 sm:grid-cols-4">
        {[
          { src: '/logos/openai.svg', alt: 'OpenAI' },
          { src: '/logos/anthropic.svg', alt: 'Anthropic' },
          { src: '/logos/cloudflare.svg', alt: 'Cloudflare' },
          { src: '/logos/supabase.svg', alt: 'Supabase' },
        ].map((l, i) => (
          <ThemedCard
            key={i}
            tone="brand"
            showSecurity={false}
            innerClassName="p-4 flex items-center justify-center"
          >
            <img
              src={l.src}
              alt={l.alt}
              className="h-8 w-auto opacity-90 grayscale hover:grayscale-0 transition-transform duration-300 will-change-transform hover:scale-[1.06]"
            />
          </ThemedCard>
        ))}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {trust.kpis.map((k) => (
          <ThemedCard
            key={k.label}
            tone="brand"
            showSecurity={false}
            innerClassName="p-6 text-center"
          >
            <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] bg-clip-text text-transparent">
              {k.value}
            </div>
            <div className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {k.label}
            </div>
            <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
              {k.desc}
            </p>
          </ThemedCard>
        ))}
      </div>
      <ThemedCard tone="brand" showSecurity={false} innerClassName="mt-8 p-6">
        {trust.quotes.map((q, i) => (
          <blockquote key={i} style={{ color: 'var(--fg)' }}>
            “{q.text}”
            <footer className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              — {q.name}
            </footer>
          </blockquote>
        ))}
      </ThemedCard>
    </section>
  );
}
