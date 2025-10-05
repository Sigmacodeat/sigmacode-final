'use client';

import { Reveal } from '@/components/ui/Reveal';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function MASPage() {
  const locale = useLocale();
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <Reveal>
        <header>
          <span
            className="inline-block rounded-full border px-3 py-1 text-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            USP
          </span>
          <h1
            className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl"
            style={{ color: 'var(--fg)' }}
          >
            MAS – Multi Agent Systeme
          </h1>
          <p className="mt-3 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
            Rollenbasierte Zusammenarbeit von Planner, Researcher und Executor – mit überprüften
            Übergaben, Guardrails und vollständiger Nachvollziehbarkeit.
          </p>
        </header>
      </Reveal>

      <nav
        className="sticky top-14 z-30 mt-6 -mx-6 border-y px-6 py-2 backdrop-blur md:top-16"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header-bg)' }}
      >
        <ul className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <li>
            <a href="#overview" className="hover:text-[var(--fg)]">
              Overview
            </a>
          </li>
          <li>
            <a href="#roles" className="hover:text-[var(--fg)]">
              Rollen
            </a>
          </li>
          <li>
            <a href="#handover" className="hover:text-[var(--fg)]">
              Handover & Policies
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:text-[var(--fg)]">
              FAQ
            </a>
          </li>
        </ul>
      </nav>

      <section id="overview" className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            Overview
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                t: 'Koordination',
                d: 'Sequencing & Parallelisierung durch Orchestrierung.',
              },
              {
                t: 'Sicherheit',
                d: 'Vor‑/Nachfilter an Übergaben zwischen Agenten.',
              },
              {
                t: 'Transparenz',
                d: 'Traces je Rolle und Übergabe – auditierbar.',
              },
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
        </Reveal>
      </section>

      <section id="roles" className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            Rollen
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                t: 'Planner',
                d: 'Zerlegt Aufgaben, plant Schritte & Policies pro Schritt.',
              },
              {
                t: 'Researcher',
                d: 'Sammelt Wissen, validiert Quellen, markiert Risiken.',
              },
              {
                t: 'Executor',
                d: 'Führt Aktionen aus – nur wenn Policies freigeben.',
              },
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
        </Reveal>
      </section>

      <section id="handover" className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            Handover & Policies
          </h2>
          <div
            className="mt-4 rounded-xl border p-5 text-sm whitespace-pre-wrap"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
            }}
          >
            {`Planner → Researcher → Executor

Bei jeder Übergabe: Policy‑Checks (PII/Compliance), Validierung und optional Redaction.
Fehlerpfade: Retries, Dead‑Letter, Rollback.`}
          </div>
        </Reveal>
      </section>

      <section id="faq" className="py-10">
        <Reveal>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            FAQ
          </h2>
          <ul className="mt-4 space-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <li>
              <span className="font-medium" style={{ color: 'var(--fg)' }}>
                Wozu MAS?
              </span>{' '}
              Komplexe Aufgaben werden schneller und zuverlässiger gelöst.
            </li>
            <li>
              <span className="font-medium" style={{ color: 'var(--fg)' }}>
                Wie sichere ich Übergaben?
              </span>{' '}
              Durch Vor‑/Nachfilter und Policy‑Durchsetzung je Schritt.
            </li>
          </ul>
          <div className="mt-6">
            <Link
              href={`/${locale}/`}
              className="rounded-lg px-5 py-3 focus:outline-none focus-visible:ring-2 transition-colors hover:opacity-90"
              style={
                {
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  '--tw-ring-color': 'var(--ring)',
                } as React.CSSProperties
              }
            >
              Zurück zur Übersicht
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
