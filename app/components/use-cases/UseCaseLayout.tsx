'use client';

import { useState, useEffect, useRef } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  Shield,
  Zap,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Reveal, SecurityIndicator } from '@/components/ui';
import ThemedCard from '@/components/ui/ThemedCard';

interface UseCasePageProps {
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  kpis: string[];
  architectureSteps: string[];
  securityFeatures: string[];
  integrations: { title: string; href: string; description: string }[];
  faq: { question: string; answer: string }[];
  children?: React.ReactNode;
  indicatorStatus?: 'unsecured' | 'processing' | 'protected' | 'warning';
}

export function UseCaseLayout({
  title,
  subtitle,
  description,
  slug,
  kpis,
  architectureSteps,
  securityFeatures,
  integrations,
  faq,
  children,
  indicatorStatus,
}: UseCasePageProps) {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'security' | 'faq'>(
    'overview',
  );
  const [announceTabChange, setAnnounceTabChange] = useState<string>('');
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const metadata: Metadata = {
    title: `Use Case: ${title}`,
    description,
    alternates: { canonical: `${prefix}/use-cases/${slug}` },
    openGraph: {
      title: `${title} – SIGMACODE AI`,
      description: `${description} Mit Security-First Architecture und vollständigen Audit-Trails.`,
      url: `${prefix}/use-cases/${slug}`,
    },
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    about: ['AI Security', 'Enterprise Workflows', 'Compliance', 'Automation'],
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${prefix}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Use Cases',
        item: `${prefix}/use-cases`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${prefix}/use-cases/${slug}`,
      },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const tabs = ['overview', 'architecture', 'security', 'faq'];
    const currentIndex = tabs.indexOf(activeTab);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        setActiveTab(tabs[prevIndex] as any);
        setAnnounceTabChange(`Tab gewechselt zu ${tabs[prevIndex]}`);
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        setActiveTab(tabs[nextIndex] as any);
        setAnnounceTabChange(`Tab gewechselt zu ${tabs[nextIndex]}`);
        break;
      case 'Home':
        e.preventDefault();
        setActiveTab('overview');
        setAnnounceTabChange('Tab gewechselt zu Übersicht');
        break;
      case 'End':
        e.preventDefault();
        setActiveTab('faq');
        setAnnounceTabChange('Tab gewechselt zu FAQ');
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.focus();
    }
  }, [activeTab]);

  // Clear announcement after screen reader has time to read it
  useEffect(() => {
    if (announceTabChange) {
      const timer = setTimeout(() => setAnnounceTabChange(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [announceTabChange]);

  const tabData = [
    {
      id: 'overview',
      label: 'Übersicht',
      icon: Info,
      ariaLabel: 'Use Case Übersicht anzeigen',
    },
    {
      id: 'architecture',
      label: 'Architektur',
      icon: BarChart3,
      ariaLabel: 'Technische Architektur anzeigen',
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      ariaLabel: 'Sicherheitsfeatures anzeigen',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: AlertTriangle,
      ariaLabel: 'Häufige Fragen anzeigen',
    },
  ];

  return (
    <>
      {/* Skip Links for Screen Readers */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <a href="#tab-navigation" className="skip-link">
          Zur Navigation springen
        </a>
      </div>

      {/* Screen Reader Announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announceTabChange}
      </div>

      {/* Metadata and JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <main
        id="main-content"
        className="mx-auto max-w-7xl px-6 py-14"
        role="main"
        aria-label={`${title} - Detaillierte Informationen`}
      >
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href={withLocale('/use-cases')}
            className="inline-flex items-center gap-2 text-sm hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
            style={{ color: 'var(--brand-600)' }}
            aria-label="Zurück zur Übersicht aller Use Cases"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Zurück zu allen Use Cases
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12" role="banner">
          {(() => {
            const lowerTitle = title.toLowerCase();
            const lowerSlug = slug.toLowerCase();
            const derived: 'unsecured' | 'processing' | 'protected' | 'warning' | undefined =
              indicatorStatus
                ? indicatorStatus
                : lowerSlug.includes('healthcare') || lowerSlug.includes('compliance')
                  ? 'protected'
                  : lowerSlug.includes('financial') || lowerSlug.includes('trading')
                    ? 'processing'
                    : lowerSlug.includes('pii') ||
                        lowerSlug.includes('security') ||
                        lowerSlug.includes('firewall')
                      ? 'processing'
                      : lowerSlug.includes('infrastructure') ||
                          lowerTitle.includes('infrastructure')
                        ? 'warning'
                        : lowerSlug.includes('government') || lowerTitle.includes('government')
                          ? 'warning'
                          : lowerSlug.includes('pharma') || lowerTitle.includes('pharma')
                            ? 'processing'
                            : lowerSlug.includes('workflow') || lowerTitle.includes('workflow')
                              ? 'processing'
                              : lowerSlug.includes('incident') || lowerTitle.includes('incident')
                                ? 'warning'
                                : undefined;
            return derived ? (
              <div className="mb-3 flex items-center justify-start">
                <SecurityIndicator status={derived} size="sm" animated />
              </div>
            ) : null;
          })()}
          <div className="mb-4">
            <span
              className="inline-block px-3 py-1 text-xs font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
              }}
              role="tag"
              aria-label="Kategorie: Use Case"
            >
              Use Case
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ color: 'var(--fg)' }}
            id="page-title"
          >
            {title}
          </h1>

          <p className="text-xl mb-6 max-w-4xl" style={{ color: 'var(--muted-foreground)' }}>
            {subtitle}
          </p>

          <p className="text-lg max-w-4xl" style={{ color: 'var(--muted-foreground)' }}>
            {description}
          </p>
        </header>

        {/* KPIs */}
        <section className="mb-12" aria-labelledby="kpis-heading">
          <h2 id="kpis-heading" className="text-2xl font-bold mb-6" style={{ color: 'var(--fg)' }}>
            Erwartete Ergebnisse
          </h2>
          <div className="grid gap-4 md:grid-cols-3" role="list" aria-label="Erwartete Ergebnisse">
            {kpis.map((kpi, index) => (
              <Reveal key={index}>
                <div role="listitem">
                  <ThemedCard tone="brand" showSecurity={false} innerClassName="p-6 text-center">
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
                      {kpi}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Typisches Ergebnis
                    </div>
                  </ThemedCard>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Tab Navigation */}
        <div
          className="mb-8"
          role="tablist"
          aria-label="Use Case Bereiche"
          id="tab-navigation"
          ref={tabListRef}
        >
          <nav
            className="flex space-x-1 bg-muted p-1 rounded-lg"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            {tabData.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeTabRef : null}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setAnnounceTabChange(`Tab gewechselt zu ${tab.label}`);
                  }}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isActive ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--background)' : undefined,
                    color: isActive ? 'var(--fg)' : 'var(--muted-foreground)',
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                  aria-label={tab.ariaLabel}
                  id={`${tab.id}-tab`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div
          className="space-y-8"
          role="tabpanel"
          aria-labelledby={`${activeTab}-tab`}
          id={`${activeTab}-panel`}
        >
          {activeTab === 'overview' && (
            <div className="prose dark:prose-invert max-w-none">{children}</div>
          )}

          {activeTab === 'architecture' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--fg)' }}>
                Architektur & Datenfluss
              </h2>
              <div className="space-y-4" role="list" aria-label="Architektur Schritte">
                {architectureSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--card)',
                    }}
                    role="listitem"
                  >
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm"
                      aria-label={`Schritt ${index + 1}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--fg)' }}>
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--fg)' }}>
                Security & Compliance Features
              </h2>
              <div
                className="grid gap-4 md:grid-cols-2"
                role="list"
                aria-label="Sicherheitsfeatures"
              >
                {securityFeatures.map((feature, index) => (
                  <Reveal key={index}>
                    <div
                      className="flex items-start gap-3 p-4 rounded-lg border"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)',
                      }}
                      role="listitem"
                    >
                      <CheckCircle
                        className="h-5 w-5 mt-0.5 flex-shrink-0"
                        style={{ color: 'var(--brand-600)' }}
                        aria-label="Feature verfügbar"
                      />
                      <div>
                        <p style={{ color: 'var(--fg)' }}>{feature}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--fg)' }}>
                Häufige Fragen
              </h2>
              <div className="space-y-4" role="list" aria-label="FAQ Bereich">
                {faq.map((item, index) => (
                  <Reveal key={index}>
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)',
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: 'var(--fg)' }}>
                        {item.question}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {item.answer}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Integration Section */}
        <section className="mt-16" aria-labelledby="integrations-heading">
          <h2
            id="integrations-heading"
            className="text-2xl font-bold mb-6"
            style={{ color: 'var(--fg)' }}
          >
            Integration mit SIGMACODE AI
          </h2>
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Integrationsmöglichkeiten"
          >
            {integrations.map((integration, index) => (
              <Reveal key={index}>
                <ThemedCard
                  tone="brand"
                  title={integration.title}
                  description={integration.description}
                  href={withLocale(integration.href)}
                  showSecurity={false}
                  innerClassName="p-6"
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center" aria-labelledby="cta-heading">
          <ThemedCard tone="brand" showSecurity={false} innerClassName="p-8">
            <h2 id="cta-heading" className="text-2xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
              Bereit für Security-First AI?
            </h2>
            <p className="text-lg mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Testen Sie diesen Use Case in einer kostenlosen 14-Tage-Testversion – keine
              Kreditkarte erforderlich.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={withLocale('/register')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
                aria-label="Kostenlos testen - Registrierung starten"
              >
                Kostenlos testen
              </Link>
              <Link
                href={withLocale('/contact')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                }}
                aria-label="Demo vereinbaren - Kontakt aufnehmen"
              >
                Demo vereinbaren
              </Link>
            </div>
          </ThemedCard>
        </section>
      </main>

      <style jsx>{`
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: var(--primary);
          color: var(--primary-foreground);
          padding: 8px;
          z-index: 1000;
          text-decoration: none;
          border-radius: 4px;
        }
        .skip-link:focus {
          top: 6px;
        }
      `}</style>
    </>
  );
}
