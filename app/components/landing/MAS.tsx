import { mas } from '@/content/landing';

export function MAS() {
  return (
    <section id={mas.id} className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{mas.title}</h2>
          <p className="mt-2 text-zinc-600">{mas.sub}</p>
        </div>
        <a
          href="#try"
          className="hidden rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 md:inline-block"
        >
          MAS‑Playbooks
        </a>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {mas.roles.map((r) => (
          <div key={r.title} className="rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="text-lg font-semibold">{r.title}</div>
            <p className="mt-2 text-zinc-600">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
