import React from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FirewallDashboard } from '@/components/firewall/FirewallDashboard';
import DisableNeonCanvas from './DisableNeonCanvas';

export const metadata = {
  title: 'SIGMACODE Neural Firewall',
  description:
    'Intelligent Defense. Autonomous Protection. KI‑Firewall mit Vor‑/Nachfilter, sub‑50ms Latenz, Zero‑Trust und transparenten Audit‑Logs.',
};

export default async function FirewallPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'firewall' });
  const tCommon = await getTranslations({ locale: params.locale, namespace: 'common' });

  return (
    <>
      <DisableNeonCanvas />
      <main className="mx-auto max-w-6xl px-6 py-14">
        {/* Header */}
        <header>
          <span
            className="inline-block rounded-full border px-3 py-1 text-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            {tCommon('security')}
          </span>
          <h1
            className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl"
            style={{ color: 'var(--fg)' }}
          >
            {t('title')}
          </h1>
          <p className="mt-3 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
            {t('realtimeProtection')}
          </p>
          <div className="mt-6">
            <a
              href="#modes"
              className="rounded-lg px-5 py-3 focus:outline-none focus-visible:ring-2 transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                // @ts-ignore
                '--tw-ring-color': 'var(--ring)' as unknown as string,
              }}
            >
              {t('realtimeProtection')}
            </a>
          </div>
        </header>

        {/* Local sub navigation */}
        <nav
          className="sticky top-14 z-30 mt-6 -mx-6 border-y px-6 py-2 backdrop-blur md:top-16"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header-bg)' }}
        >
          <ul className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <li>
              <a href="#overview" className="hover:text-[var(--fg)]">
                {tCommon('overview')}
              </a>
            </li>
            <li>
              <a href="#live" className="hover:text-[var(--fg)]">
                {t('live')}
              </a>
            </li>
            <li>
              <a href="#modes" className="hover:text-[var(--fg)]">
                {t('modes')}
              </a>
            </li>
            <li>
              <a href="#env" className="hover:text-[var(--fg)]">
                {t('onboarding')}
              </a>
            </li>
            <li>
              <a href="#audit" className="hover:text-[var(--fg)]">
                {t('audit')}
              </a>
            </li>
          </ul>
        </nav>

        {/* Overview */}
        <section id="overview" className="py-10">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {tCommon('overview')}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { t: t('security'), d: t('testModeDescription') },
              { t: t('fast'), d: t('enforceModeDescription') },
              { t: t('auditable'), d: t('fewMinutesActive') },
            ].map((b) => (
              <div
                key={b.t}
                className="rounded-xl border p-5 shadow-sm"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--card-foreground)',
                }}
              >
                <div className="font-semibold" style={{ color: 'var(--fg)' }}>
                  {b.t}
                </div>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {b.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Live Dashboard */}
        <section id="live" className="py-10">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {t('live')}
          </h2>
          <div
            className="mt-4 rounded-xl border p-4"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <FirewallDashboard />
          </div>
        </section>

        {/* How it protects */}
        <section id="modes" className="py-10">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {t('realtimeProtection')}
          </h2>
          <p className="mt-2 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
            {t('testModeDescription')}
          </p>
          <div className="mt-6 flex justify-center">
            <img
              src="/firewall/shadow-enforce-diagram.svg"
              alt="Firewall Shadow vs Enforce Diagramm"
              className="max-w-full h-auto rounded-xl"
              loading="lazy"
            />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
                {t('testModeTitle')}
              </h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('testModeDescription')}
              </p>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li className="flex items-center gap-3">• {t('testModeBenefits')}</li>
                <li className="flex items-center gap-3">• {t('clearRecommendations')}</li>
                <li className="flex items-center gap-3">• {t('perfectForRiskFreeStart')}</li>
              </ul>
            </div>
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
                {t('enforceModeTitle')}
              </h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('enforceModeDescription')}
              </p>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li className="flex items-center gap-3">• {t('enforceModeBenefits')}</li>
                <li className="flex items-center gap-3">• {t('rbacLimitsContentValidation')}</li>
                <li className="flex items-center gap-3">• {t('allowBlockWithReasoning')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Onboarding */}
        <section id="env" className="py-10">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {t('quickStart')}
          </h2>
          <p className="mt-2 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
            {t('fewMinutesActive')}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                {t('step1Activate')}
              </div>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li className="flex items-center gap-2">
                  <code
                    className="rounded px-2 py-0.5 font-mono text-xs"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                  >
                    {t('activateFirewall')}
                  </code>
                  <span>
                    : <em>true|false</em>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <code
                    className="rounded px-2 py-0.5 font-mono text-xs"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                  >
                    {t('shadowMode')}
                  </code>
                  <span>
                    : <em>enforce | shadow</em>
                  </span>
                </li>
              </ul>
            </div>
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                {t('step2Connect')}
              </div>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li className="flex items-center gap-2">
                  <code
                    className="rounded px-2 py-0.5 font-mono text-xs"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                  >
                    {t('superagentUrl')}
                  </code>
                </li>
                <li className="flex items-center gap-2">
                  <code
                    className="rounded px-2 py-0.5 font-mono text-xs"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                  >
                    {t('superagentApiKey')}
                  </code>
                </li>
              </ul>
            </div>
          </div>
          <details
            className="mt-4 rounded-xl border p-5"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <summary className="cursor-pointer font-medium">
              {t('optionalTechnicalDetails')}
            </summary>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {t('everyCallGetsId')}
            </p>
          </details>
        </section>

        {/* Audit */}
        <section id="audit" className="py-10">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {t('transparentLogging')}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                {t('whatIsRecorded')}
              </div>
              <pre
                className="whitespace-pre-wrap rounded-xl border p-5 text-sm"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                }}
              >
                <code>{`POST /api/agents/{agentId}/invoke
x-request-id: req_8f3b2c9...
content-type: application/json
mode: shadow
x-signature: sha256-...
`}</code>
              </pre>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                {t('howDecisionsLook')}
              </div>
              <pre
                className="whitespace-pre-wrap rounded-xl border p-5 text-sm"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                }}
              >
                <code>{`{
  "requestId": "req_8f3b2c9...",
  "mode": "shadow",
  "backend": "superagent",
  "latency_ms": 23,
  "decision": "allow",
  "confidence": 0.97
}`}</code>
              </pre>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href={`/${params.locale}/`}
              className="rounded-lg px-5 py-3 focus:outline-none focus-visible:ring-2 transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                // @ts-ignore
                '--tw-ring-color': 'var(--ring)' as unknown as string,
              }}
            >
              {t('backToOverview')}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
