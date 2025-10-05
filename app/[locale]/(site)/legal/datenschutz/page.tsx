export const metadata = {
  title: 'Datenschutz',
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Datenschutzerklärung</h1>
        <div className="prose prose-zinc mt-6 max-w-none">
          <p>
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Diese Erklärung erläutert
            Art, Umfang und Zweck der Verarbeitung personenbezogener Daten.
          </p>
          <h2>Verantwortlicher</h2>
          <p>SIGMACODE AI · E‑Mail: inbox@sigmacode.ai</p>
          <h2>Verarbeitungszwecke</h2>
          <ul>
            <li>Bereitstellung der Website und ihrer Funktionen</li>
            <li>Kontaktanfragen via Formular</li>
            <li>Reichweitenmessung (Plausible, ohne Cookies)</li>
          </ul>
          <h2>Rechtsgrundlagen</h2>
          <p>Art. 6 Abs. 1 lit. a, b, f DSGVO</p>
          <h2>Speicherdauer</h2>
          <p>So lange wie zur Zweckerfüllung erforderlich bzw. gesetzlich vorgeschrieben.</p>
          <h2>Betroffenenrechte</h2>
          <ul>
            <li>Auskunft, Berichtigung, Löschung, Einschränkung</li>
            <li>Widerspruch gegen Verarbeitung</li>
            <li>Datenübertragbarkeit</li>
          </ul>
          <h2>Kontakt</h2>
          <p>Für Anfragen wenden Sie sich bitte an inbox@sigmacode.ai.</p>
        </div>
      </section>
    </main>
  );
}
