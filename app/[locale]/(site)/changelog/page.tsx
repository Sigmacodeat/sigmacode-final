export const metadata = {
  title: 'Changelog',
  description: 'Alle Updates und Verbesserungen von SIGMACODE AI im Überblick.',
};

const items = [
  {
    date: new Date().toISOString().slice(0, 10),
    title: 'Großes Landing‑Page Update (SaaS Polish Phase 3–5)',
    changes: [
      'Header, Footer, Announcement‑Bar, Sticky CTA',
      'Sections: Chatbot, Workflow, MAS, Playground, Solution Pillars, Business, Trust, Testimonials, Case Studies, Integrations, Feature‑Vergleich, Pricing, FAQ, Final CTA',
      'Kontaktseite + API, Security‑Seite, Docs‑Stub, SEO (Sitemap, Robots, JSON‑LD), Plausible‑Events',
      'Theme Toggle, Scroll‑to‑Top',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Changelog</h1>
        <p className="mt-2 text-zinc-600">Alle sichtbaren Änderungen kurz zusammengefasst.</p>
        <div className="mt-8 space-y-6">
          {items.map((it, idx) => (
            <article key={idx} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-xs text-zinc-500">{it.date}</div>
              <h2 className="mt-1 text-lg font-semibold">{it.title}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                {it.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
