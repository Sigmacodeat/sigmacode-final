import { testimonials } from '@/content/landing';
import { Reveal } from '@/components/ui/Reveal';

export function Testimonials() {
  return (
    <section id={testimonials.id} className="mx-auto max-w-6xl px-6 py-14">
      <h2 className="text-2xl font-bold">{testimonials.title}</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {testimonials.items.map((t, i) => (
          <Reveal key={i} delayMs={i * 85}>
            <figure className="rounded-xl border border-border bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-zinc-900">
              <blockquote className="text-zinc-800 dark:text-zinc-100">"{t.quote}"</blockquote>
              <figcaption className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                {t.name} · {t.company}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
