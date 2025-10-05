import { problem } from '@/content/landing';
import { Reveal } from '@/components/ui/Reveal';

export function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-2xl font-bold">{problem.title}</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {problem.points.map((p, i) => (
          <Reveal key={p.title} delayMs={i * 70}>
            <div className="rounded-xl border border-zinc-200 p-6 shadow-sm transition-transform hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {p.title}
              </div>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{p.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
