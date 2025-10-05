'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Reveal } from '@/components/ui/Reveal';
import WorkflowHeroDemo from '@/components/marketing/WorkflowHeroDemo';
import UseCaseCard from '../use-cases/components/UseCaseCard';
import { USE_CASES } from '../use-cases/useCasesV2';
import type { UseCase } from '../use-cases/useCasesV2';
import { Boxes, Clock, History, Shield } from 'lucide-react';

export default function WorkflowsPage() {
  const [activeId, setActiveId] = useState<string>('overview');
  const locale = useLocale();
  const prefix = `/${locale}`;
  const withLocale = (href: string) => {
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))
      return href;
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    if (href === '/') return prefix + '/';
    if (href.startsWith('/#')) return `${prefix}${href}`;
    return `${prefix}${href}`;
  };

  useEffect(() => {
    const ids = ['overview', 'pipeline', 'observability', 'faq'] as const;
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Relevante Use Cases für Workflows-Seite (Kategorien)
  const filteredUseCases = USE_CASES.filter((u) =>
    ['workflow', 'security', 'compliance', 'infrastructure'].includes(u.category),
  ).map(({ icon, ...rest }) => rest); // Entfernt das icon-Feld, da es bereits in UseCaseCard gerendert wird

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = (e.currentTarget.getAttribute('href') || '').trim();
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (href.slice(1)) setActiveId(href.slice(1));
      history.replaceState(null, '', href);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <Reveal>
        <header>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs shadow-sm ring-1"
            style={{
              background:
                'linear-gradient(90deg, rgba(10,31,68,0.85) 0%, rgba(0,246,255,0.15) 100%)',
              color: 'var(--muted-foreground)',
              // @ts-ignore
              '--tw-ring-color': '#00F6FF' as unknown as string,
            }}
          >
            <Shield size={14} className="opacity-80" /> USP
          </span>
          <h1
            className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl"
            style={{ color: 'var(--fg)' }}
          >
            Workflows
          </h1>
          <p className="mt-3 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
            Wiederholbare Pipelines mit Versionierung, Scheduling, Webhooks und vollständiger
            Observability. Kostenkontrolle pro Team und Run durch transparente Traces.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#overview"
              onClick={handleAnchorClick}
              className="rounded-lg px-4 py-2 text-sm transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              Features ansehen
            </a>
            <a
              href="#demo"
              onClick={handleAnchorClick}
              className="rounded-lg border px-4 py-2 text-sm transition hover:border-[#00F6FF]"
              style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
            >
              Live‑Demo
            </a>
          </div>
        </header>
      </Reveal>

      {/* Interaktive Hero-Demo */}
      <section id="demo" className="mt-8">
        <Reveal>
          <div
            className="rounded-xl border p-4 shadow-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <WorkflowHeroDemo />
          </div>
        </Reveal>
      </section>

      <nav
        className="sticky top-14 z-30 mt-6 -mx-6 border-y px-6 py-2 backdrop-blur md:top-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header-bg)' }}
      >
        <ul className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'pipeline', label: 'Pipeline' },
            { id: 'observability', label: 'Observability' },
            { id: 'faq', label: 'FAQ' },
          ].map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={handleAnchorClick}
                className={`inline-block border-b-2 pb-1 transition-colors ${
                  activeId === item.id
                    ? 'border-[var(--brand-end)] text-[var(--fg)]'
                    : 'border-transparent hover:text-[var(--fg)]/80'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="overview" className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold">Overview</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                t: 'Bausteine',
                d: 'Prompts, Tools, Policies, Branching als Kacheln.',
                icon: <Boxes size={18} />,
              },
              {
                t: 'Scheduling',
                d: 'Cron/Trigger, Dead‑Letter‑Queues, Retries.',
                icon: <Clock size={18} />,
              },
              {
                t: 'Revisionssicher',
                d: 'Versionierung & Rollbacks in Minuten.',
                icon: <History size={18} />,
              },
            ].map((b) => (
              <div
                key={b.t}
                className="group rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--card-foreground)',
                }}
              >
                <div
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: 'var(--fg)' }}
                >
                  <span className="text-[#00F6FF]">{b.icon}</span>
                  {b.t}
                </div>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {b.d}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="pipeline" className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold">Pipeline</h2>
          <div
            className="mt-4 rounded-xl border p-5 text-sm whitespace-pre-wrap"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
            }}
          >
            {`Ingest → Validate (Vorfilter) → Execute (SIGMACODE AI) → Validate (Nachfilter) → Persist → Notify

Branches: Conditional, Parallel Steps, Retries, Timeouts`}
          </div>
        </Reveal>
      </section>

      <section id="observability" className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold">Observability</h2>
          <ul className="mt-4 space-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <li>
              <span className="font-medium" style={{ color: 'var(--fg)' }}>
                Traces:
              </span>{' '}
              End‑to‑End Laufzeit & Schritte je Run.
            </li>
            <li>
              <span className="font-medium" style={{ color: 'var(--fg)' }}>
                Metriken:
              </span>{' '}
              Latenz, Erfolgsrate, Policy‑Treffer.
            </li>
            <li>
              <span className="font-medium" style={{ color: 'var(--fg)' }}>
                Kosten:
              </span>{' '}
              Token‑Budget, Kostenvorschau pro Schritt.
            </li>
          </ul>
        </Reveal>
      </section>

      {/* Branchen-optimierte Use Cases (dedupliziert, zentral verwaltet) */}
      <section className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold">
            {filteredUseCases.length}+ Branchen‑optimierte Use Cases
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Firewall‑gesicherte Workflows – sofort einsatzbereit. Auswahl aus der zentralen
            Use‑Case‑Bibliothek.
          </p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {filteredUseCases.map((item) => (
              <UseCaseCard key={item.href} item={item} />
            ))}
          </div>
        </Reveal>
      </section>

      <section id="faq" className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold">FAQ</h2>
          <ul className="mt-4 space-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <li>
              <span className="font-medium" style={{ color: 'var(--fg)' }}>
                Kann ich externe Trigger nutzen?
              </span>{' '}
              Ja, via Webhooks/Events.
            </li>
            <li>
              <span className="font-medium" style={{ color: 'var(--fg)' }}>
                Versionierung?
              </span>{' '}
              Ja, Pipelines sind versioniert und auditierbar.
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={withLocale('/')}
              className="rounded-lg px-5 py-3 focus:outline-none focus-visible:ring-2 transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                // @ts-ignore - CSS var for ring color
                '--tw-ring-color': 'var(--ring)' as unknown as string,
              }}
            >
              Zurück zur Übersicht
            </Link>
            <a
              href="#overview"
              onClick={handleAnchorClick}
              className="rounded-lg border px-5 py-3 transition hover:border-[#00F6FF]"
              style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
            >
              Nach oben
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
