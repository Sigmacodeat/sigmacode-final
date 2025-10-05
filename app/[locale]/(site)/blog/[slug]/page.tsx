import type { Metadata } from 'next';
import Link from 'next/link';

interface Params {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const title = decodeURIComponent(params.slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${title} – Blog`,
    description:
      'SIGMACODE AI Blog – Security‑First Best Practices, AI‑Firewall, compliance und Enterprise‑Workflows.',
  };
}

export default function BlogPostPage({ params }: Params) {
  const title = decodeURIComponent(params.slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      <nav className="mb-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        <Link
          href={`/${params.locale}/blog`}
          className="hover:underline"
          style={{ color: 'var(--brand-600)' }}
        >
          ← Zurück zum Blog
        </Link>
      </nav>

      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>
            {title}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Veröffentlicht: <time>{new Date().toLocaleDateString('de-DE')}</time>
          </p>
        </header>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            Dies ist ein Platzhalter‑Artikel. Die Blog‑API ist in Arbeit. Hier werden Inhalte zu
            Security‑First AI, Agent‑Firewall, Compliance und Workflows erscheinen.
          </p>
          <h2>Highlights</h2>
          <ul>
            <li>Firewall‑gesicherte Agenten mit Vor‑/Nachfilter</li>
            <li>PII‑Redaction & Prompt‑Guards</li>
            <li>Audit‑Transparenz & Compliance‑Nachweise</li>
          </ul>
        </div>
      </article>
    </main>
  );
}
