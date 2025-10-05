import Link from 'next/link';

export const metadata = {
  title: 'Security & Compliance',
  description:
    'Firewall‑Policies, Kong API Gateway (TLS, Routing, Rate‑Limits), RBAC, Audit‑Logs, DLP und Data Residency – Sicherheit und Compliance für AI‑Agenten in der Produktion.',
};

export default function SecurityPage({ params }: { params: { locale: string } }) {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>
          Security & Compliance
        </h1>
        <p className="mt-3 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
          Sicherheit ist ein Feature – keine Option. Unsere Firewall prüft Ein‑ und Ausgaben,
          erzwingt Policies und schreibt revisionssichere Audit‑Logs. Rollen, Schlüssel und
          Datenflüsse sind klar kontrolliert.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-2">
        <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">Firewall‑Policies</h2>
          <ul
            className="mt-2 list-disc space-y-1 pl-5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <li>Vorfilter: PII, Toxicity, Prompt‑Injection</li>
            <li>Nachfilter: Halluzination‑Checks, Redaction, Data Egress</li>
            <li>Shadow/Enforce Modi pro Agent und Route</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">Kong Gateway & RBAC</h2>
          <ul
            className="mt-2 list-disc space-y-1 pl-5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <li>Kong: TLS‑Terminierung, Routing, globale/route‑spezifische Rate‑Limits</li>
            <li>RBAC: Rollen (Admin, Dev, Analyst, Operator) und API‑Keys/Quoten</li>
            <li>Mandantenfähigkeit, Trennung der Datenräume</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">Audit & Compliance</h2>
          <ul
            className="mt-2 list-disc space-y-1 pl-5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <li>Unveränderliche Logs (Hashing/Signaturen)</li>
            <li>Revisionssichere Verläufe je Request/Policy</li>
            <li>DSGVO‑Prozesse: Export, Löschung, Data Residency</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">DLP & Secrets</h2>
          <ul
            className="mt-2 list-disc space-y-1 pl-5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <li>PII‑Redaction, Maskierung sensibler Daten</li>
            <li>Outbound‑Filter (Domains, Typen, Größenlimits)</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
        >
          <h3 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
            Sicherheit ohne Friktion
          </h3>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
            Aktiviere Shadow/Enforce pro Agent – sofort sichtbar, sofort auditierbar.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href={`/${params.locale}/`}
              className="rounded-lg border px-5 py-3 transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--fg)',
                backgroundColor: 'var(--card)',
              }}
            >
              Zur Startseite
            </Link>
            <Link
              href={`/${params.locale}/#try`}
              className="rounded-lg px-5 py-3 transition-colors"
              style={{ backgroundColor: 'var(--brand)', color: 'var(--brand-foreground)' }}
            >
              Jetzt testen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
