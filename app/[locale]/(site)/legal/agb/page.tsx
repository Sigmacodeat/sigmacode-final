export const metadata = {
  title: 'Allgemeine Geschäftsbedingungen (AGB)',
};

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        <div className="prose prose-zinc mt-6 max-w-none">
          <p>
            Diese AGB regeln die Nutzung der Dienste von SIGMACODE AI. Abweichende Bedingungen des
            Kunden gelten nur, wenn sie schriftlich bestätigt wurden.
          </p>
          <h2>Leistungsumfang</h2>
          <p>
            Bereitstellung von AI‑Agenten, Workflows und Sicherheits‑Policies (Firewall) gem.
            Leistungsbeschreibung.
          </p>
          <h2>Nutzung & Pflichten</h2>
          <ul>
            <li>Keine rechtswidrige Nutzung, keine Verletzung von Rechten Dritter</li>
            <li>Sorgfältiger Umgang mit Zugangsdaten und API‑Schlüsseln</li>
          </ul>
          <h2>Haftung</h2>
          <p>
            Haftung nur für Vorsatz und grobe Fahrlässigkeit; im Übrigen gemäß gesetzlicher
            Vorgaben.
          </p>
          <h2>Laufzeit & Kündigung</h2>
          <p>
            Monatlich kündbar zum Ende des Abrechnungszeitraums, sofern nicht anders vereinbart.
          </p>
          <h2>Schlussbestimmungen</h2>
          <p>
            Anwendbares Recht und Gerichtsstand werden separat vereinbart. Salvatorische Klausel.
          </p>
        </div>
      </section>
    </main>
  );
}
