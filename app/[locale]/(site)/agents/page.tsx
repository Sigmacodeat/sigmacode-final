'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SuperAgentsAnimation } from '@/components/landing/SuperAgentsAnimation';
import { Shield, Zap, FileSearch, Lock } from 'lucide-react';

export default function AgentsPage() {
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
    const ids = ['overview', 'architecture', 'policies', 'faq'] as const;
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible section
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
      <header>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs shadow-sm ring-1"
          style={{
            background: 'linear-gradient(90deg, rgba(10,31,68,0.85) 0%, rgba(0,246,255,0.15) 100%)',
            color: 'var(--muted-foreground)',
            // ring color aligns with accent
            // @ts-ignore
            '--tw-ring-color': '#00F6FF' as unknown as string,
          }}
        >
          <Shield size={14} className="opacity-80" /> Use Case
        </span>
        <h1
          className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{ color: 'var(--fg)' }}
        >
          Firewall‑Powered Agents
        </h1>
        <p className="mt-3 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
          Sichere AI‑Agenten mit Vor‑/Nachfilter, Audit‑Transparenz und konfigurierbaren Policies.{' '}
          <strong>Shadow</strong> zum risikofreien Testen, <strong>Enforce</strong> für
          Policy‑Durchsetzung.
        </p>
      </header>

      <nav
        className="sticky top-14 z-30 mt-6 -mx-6 border-y px-6 py-2 backdrop-blur md:top-16"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--header-bg)',
        }}
      >
        <ul className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'architecture', label: 'Architektur' },
            { id: 'policies', label: 'Policies & Beispiele' },
            { id: 'faq', label: 'FAQ' },
          ].map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={handleAnchorClick}
                className={`inline-block border-b-2 pb-1 transition-colors ${
                  activeId === item.id
                    ? 'border-[#00F6FF] text-white'
                    : 'border-transparent hover:text-white/80'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="mt-6 rounded-xl border p-4 shadow-sm"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)',
        }}
      >
        <SuperAgentsAnimation />
      </div>

      <section id="overview" className="py-10">
        <h2 className="text-2xl font-bold">Overview</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            {
              t: 'Sicher',
              d: 'PII‑Filter, Prompt‑Guards, Policy‑Checks vor & nach jedem Call.',
              icon: <Lock size={18} />, // security
            },
            {
              t: 'Schnell',
              d: '<100ms Zusatzlatenz durch leichte Filter‑Pipeline.',
              icon: <Zap size={18} />, // speed
            },
            {
              t: 'Auditierbar',
              d: 'Revisionssichere Logs, Export & Transparenz.',
              icon: <FileSearch size={18} />, // audit
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
              <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--fg)' }}>
                <span className="text-[#00F6FF]">{b.icon}</span>
                {b.t}
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {b.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="architecture" className="py-10">
        <h2 className="text-2xl font-bold">Architektur</h2>
        <div
          className="mt-4 rounded-xl border p-5 text-sm"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--card-foreground)',
          }}
        >
          {`Client → Vorfilter (Firewall) → SIGMACODE AI Agent → Nachfilter (Firewall) → Response

Vorfilter: PII, Prompt‑Injection, Policy
Nachfilter: Compliance, Halluzination‑Checks, Redaction`}
        </div>
      </section>

      <section id="policies" className="py-10">
        <h2 className="text-2xl font-bold">Policies & Beispiele</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div
            className="rounded-xl border p-5 transition hover:border-[#00F6FF] hover:shadow-md"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
            }}
          >
            <div
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: 'var(--fg)' }}
            >
              <Lock size={16} className="text-[#00F6FF]" /> PII‑Redaction
            </div>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Schwärzt personenbezogene Daten in Ein‑ und Ausgaben.
            </p>
          </div>
          <div
            className="rounded-xl border p-5 transition hover:border-[#00F6FF] hover:shadow-md"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
            }}
          >
            <div
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: 'var(--fg)' }}
            >
              <Shield size={16} className="text-[#00F6FF]" /> Prompt‑Injection Guard
            </div>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Blockiert Anweisungen, die Policies umgehen sollen.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="py-10">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <ul className="mt-4 space-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <li>
            <span className="font-medium">Shadow vs Enforce?</span> Shadow protokolliert ohne
            Blocken; Enforce setzt Policies hart durch.
          </li>
          <li>
            <span className="font-medium">Welche LLMs?</span> OpenAI, Anthropic u. a. via Adapter –
            eigene Modelle via Proxy.
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
      </section>
    </main>
  );
}
