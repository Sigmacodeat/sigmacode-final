export const metadata = {
  title: 'Impressum',
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Impressum</h1>
        <div className="prose prose-zinc mt-6 max-w-none">
          <p>
            <strong>Betreiber:</strong>
            <br />
            SIGMACODE AI
          </p>
          <p>
            <strong>E-Mail:</strong> inbox@sigmacode.ai
          </p>
          <p>
            <strong>Adresse:</strong> Wird nachgereicht
          </p>
          <p>Inhaltlich Verantwortlicher gem. § 55 Abs. 2 RStV: SIGMACODE AI</p>
        </div>
      </section>
    </main>
  );
}
