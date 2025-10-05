import Link from 'next/link';
import {
  ShoppingBag,
  Plug,
  Layers,
  ShieldCheck,
  Rocket,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import ThemedCard from '@/components/ui/ThemedCard';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'SIGMACODE App Store – Erweiterungen, Integrationen & Workflows',
  description:
    'App Store für sichere AI‑Workflows: geprüfte Erweiterungen, Integrationen und vorgefertigte Pipelines – kuratiert, versioniert und firewall‑kompatibel.',
  alternates: { canonical: '/appstore' },
  openGraph: {
    title: 'SIGMACODE App Store',
    description:
      'Erweiterungen & Integrationen für sichere Workflows – kuratiert, versioniert, mit Policies & Reviews.',
    url: '/appstore',
  },
};

export default async function AppStorePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'appstore' });
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      {/* Header */}
      <header>
        <span
          className="inline-block rounded-full border px-3 py-1 text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          {t('badge')}
        </span>
        <h1
          className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: 'var(--fg)' }}
        >
          {t('title')}
        </h1>
        <p className="mt-3 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
          {t('subtitle')}
        </p>
      </header>

      {/* Local sub navigation */}
      <nav
        className="sticky top-14 z-30 mt-6 -mx-6 border-y px-6 py-2 backdrop-blur md:top-16"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--header-bg)',
          color: 'var(--muted-foreground)',
        }}
      >
        <ul className="flex flex-wrap gap-4 text-sm">
          <li>
            <a href="#overview" className="hover:text-[var(--fg)]">
              {t('nav.overview')}
            </a>
          </li>
          <li>
            <a href="#features" className="hover:text-[var(--fg)]">
              {t('nav.features')}
            </a>
          </li>
          <li>
            <a href="#publishing" className="hover:text-[var(--fg)]">
              {t('nav.publishing')}
            </a>
          </li>
          <li>
            <a href="#cta" className="hover:text-[var(--fg)]">
              {t('nav.cta')}
            </a>
          </li>
        </ul>
      </nav>

      {/* Overview */}
      <section id="overview" className="mt-10">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          {t('nav.overview')}
        </h2>
        <p className="mt-2 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
          {t('overview')}
        </p>
      </section>

      {/* Feature Grid */}
      <section id="features" className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ThemedCard
          tone="appstore"
          title={t('features.curated.title')}
          description={t('features.curated.desc')}
          icon={<ShoppingBag className="w-6 h-6" />}
          showSecurity={false}
        />

        <ThemedCard
          tone="appstore"
          title={t('features.integrations.title')}
          description={t('features.integrations.desc')}
          icon={<Plug className="w-6 h-6" />}
          showSecurity={false}
        />

        <ThemedCard
          tone="appstore"
          title={t('features.pipelines.title')}
          description={t('features.pipelines.desc')}
          icon={<Layers className="w-6 h-6" />}
          showSecurity={false}
        />

        <ThemedCard
          tone="appstore"
          title={t('features.reviews.title')}
          description={t('features.reviews.desc')}
          icon={<ShieldCheck className="w-6 h-6" />}
          showSecurity={false}
        />

        <ThemedCard
          tone="appstore"
          title={t('features.install.title')}
          description={t('features.install.desc')}
          icon={<Rocket className="w-6 h-6" />}
          showSecurity={false}
        />

        <ThemedCard
          tone="appstore"
          title={t('features.licensing.title')}
          description={t('features.licensing.desc')}
          icon={<CreditCard className="w-6 h-6" />}
          showSecurity={false}
        />
      </section>

      {/* Publishing & Reviews */}
      <section id="publishing" className="mt-12">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          {t('publishing.title')}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ThemedCard
            tone="appstore"
            title={t('publishing.submissionTitle')}
            description={t('publishing.submissionDesc')}
            showSecurity={false}
          />
          <ThemedCard
            tone="appstore"
            title={t('publishing.verifyTitle')}
            description={t('publishing.verifyDesc')}
            showSecurity={false}
          />
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mt-12">
        <ThemedCard
          tone="appstore"
          title={t('cta.title')}
          description={t('cta.desc')}
          href={`/${params.locale}/contact`}
          ctaLabel={t('cta.contact')}
          icon={<ArrowRight className="w-5 h-5" />}
          showSecurity={false}
        />
      </section>
    </main>
  );
}
