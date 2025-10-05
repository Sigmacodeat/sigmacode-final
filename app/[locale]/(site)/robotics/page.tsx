import Link from 'next/link';
import { Cpu, Cog, PackageCheck, Workflow, Shield, Bot, ArrowRight } from 'lucide-react';
import ThemedCard from '@/components/ui/ThemedCard';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'SIGMACODE Robotics – Autonome Systeme mit AI‑Firewall',
  description:
    'State of the Art Robotics: sichere autonome Systeme, koordinierte Multi‑Agenten, Echtzeit‑Sensorfusion und Policies – geschützt durch die Neural Firewall.',
  alternates: { canonical: '/robotics' },
  openGraph: {
    title: 'SIGMACODE Robotics',
    description:
      'Autonome Systeme mit Firewall‑Schutz: Sensorfusion, Planung, Multi‑Agent‑Koordination und Policies.',
    url: '/robotics',
  },
};

export default async function RoboticsPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'robotics' });
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
            <a href="#safety" className="hover:text-[var(--fg)]">
              {t('nav.safety')}
            </a>
          </li>
          <li>
            <a href="#demo" className="hover:text-[var(--fg)]">
              {t('nav.demo')}
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
          tone="robotics"
          title={t('features.sensorfusion.title')}
          description={t('features.sensorfusion.desc')}
          icon={<Cpu className="w-6 h-6" />}
          showSecurity={false}
        />
        <ThemedCard
          tone="robotics"
          title={t('features.planning.title')}
          description={t('features.planning.desc')}
          icon={<Workflow className="w-6 h-6" />}
          showSecurity={false}
        />
        <ThemedCard
          tone="robotics"
          title={t('features.multiagent.title')}
          description={t('features.multiagent.desc')}
          icon={<Bot className="w-6 h-6" />}
          showSecurity={false}
        />
        <ThemedCard
          tone="robotics"
          title={t('features.firewall.title')}
          description={t('features.firewall.desc')}
          icon={<Shield className="w-6 h-6" />}
          showSecurity={false}
        />
        <ThemedCard
          tone="robotics"
          title={t('features.twins.title')}
          description={t('features.twins.desc')}
          icon={<Cog className="w-6 h-6" />}
          showSecurity={false}
        />
        <ThemedCard
          tone="robotics"
          title={t('features.safety.title')}
          description={t('features.safety.desc')}
          icon={<PackageCheck className="w-6 h-6" />}
          showSecurity={false}
        />
      </section>

      {/* Safety & Compliance */}
      <section id="safety" className="mt-12">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          {t('safety.title')}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ThemedCard
            tone="robotics"
            title={t('safety.policiesTitle')}
            description={t('safety.policiesDesc')}
            showSecurity={false}
          />
          <ThemedCard
            tone="robotics"
            title={t('safety.auditTitle')}
            description={t('safety.auditDesc')}
            showSecurity={false}
          />
        </div>
      </section>

      {/* CTA */}
      <section id="demo" className="mt-12">
        <ThemedCard
          tone="robotics"
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
