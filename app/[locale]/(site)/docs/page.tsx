export const metadata = {
  title: 'Dokumentation',
  description: 'Erste Schritte, API und Best Practices für Firewall‑Powered Agents.',
};

export default function DocsPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>
          Dokumentation
        </h1>
        <p className="mt-3" style={{ color: 'var(--muted-foreground)' }}>
          Kurzfassung der wichtigsten Themen. Ausführliche Docs folgen.
        </p>

        <div className="mt-8 grid gap-6">
          <article className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Schnellstart</h2>
            <ol
              className="mt-2 list-decimal space-y-1 pl-5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <li>Agent anlegen (Chatbot, Workflow oder MAS)</li>
              <li>Firewall‑Modus wählen (Shadow → Enforce)</li>
              <li>API‑Key generieren, Request an /api/agents/[agentId]/invoke</li>
            </ol>
          </article>

          <article
            className="rounded-xl border p-6 shadow-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
            }}
          >
            <h2 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
              API Grundlagen
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              POST /api/agents/[agentId]/invoke – JSON Body mit Prompt, Tools, Parametern. Response
              enthält Policy‑Metadaten.
            </p>
          </article>

          <article
            className="rounded-xl border p-6 shadow-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
            }}
          >
            <h2 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
              Policies & Sicherheit
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Vorfilter (PII/Toxicity/Injection), Nachfilter (Redaction/Halluzination), RBAC &
              Audit‑Logs.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
