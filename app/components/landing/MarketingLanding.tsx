'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThemedCard from '@/components/ui/ThemedCard';
import { USE_CASES } from '@/app/[locale]/(site)/use-cases/useCases';
import { getUseCaseBySlug, type UseCaseTheme } from '@/app/lib/use-case-themes';
import { useNotification } from '@/components/notifications/NotificationSystem';
import { Integrations } from '@/components/landing/Integrations';
import { CenteredHero } from '@/components/landing/CenteredHero';
import { Workflow } from '@/components/landing/Workflow';
import { SolutionPillars } from '@/components/landing/SolutionPillars';
import { FAQ } from '@/components/landing/FAQ';
import { Testimonials } from '@/components/landing/Testimonials';
import { AIChatbot } from '@/components/chat/AIChatbot';
import { Pricing } from '@/components/landing/Pricing';
import { ArrowRight, Shield, Clock, DollarSign, Eye, GitBranch, TrendingUp } from 'lucide-react';

import { analyticsUtils, getAnalytics } from '@/app/lib/analytics';
import { useLocale, useTranslations } from 'next-intl';

export function MarketingLandingPage() {
  const locale = useLocale();
  const prefix = `/${locale}`;
  const tLanding = useTranslations('landing');
  const withLocale = (href: string) => {
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))
      return href;
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    if (href === '/') return prefix + '/';
    if (href.startsWith('/#')) return `${prefix}${href}`;
    return `${prefix}${href}`;
  };

  const notification = useNotification();

  useEffect(() => {
    // Welcome notification
    const timer = setTimeout(() => {
      notification.success(
        '🚀 Quantum Neural Shield',
        'Firewall‑Powered Agents & Workflows – Sub‑100ms Neural AI Firewall.',
        { category: 'user', priority: 'medium', autoHide: true },
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [notification]);

  function handleDemoRequest(data: {
    name: string;
    email: string;
    company: string;
    useCase: string;
  }): void {
    // Notify user
    notification.success(
      tLanding('chat.leads.demoSuccessTitle'),
      tLanding('chat.leads.demoSuccessDesc'),
      { category: 'user', priority: 'high', autoHide: true },
    );

    // Track analytics (custom + utils)
    getAnalytics().trackEvent({
      name: 'demo_request',
      category: 'conversion',
      action: 'request',
      label: data.company || data.email,
      customData: { source: 'homepage_chat', ...data },
    });
    analyticsUtils.trackFormSubmission('demo_request', true, { source: 'homepage_chat', ...data });
  }

  function handleContactRequest(data: { name: string; email: string; message: string }): void {
    // Notify user
    notification.success(
      tLanding('chat.leads.contactSuccessTitle'),
      tLanding('chat.leads.contactSuccessDesc'),
      { category: 'user', priority: 'high', autoHide: true },
    );

    // Track analytics (custom + utils)
    getAnalytics().trackEvent({
      name: 'contact_request',
      category: 'conversion',
      action: 'request',
      label: data.email,
      customData: { source: 'homepage_chat', priority: 'normal', ...data },
    });
    analyticsUtils.trackFormSubmission('contact_request', true, {
      source: 'homepage_chat',
      ...data,
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section (Centered with Trust Badges) */}
      <CenteredHero />

      {/* How it works / Wie es funktioniert */}
      <section id="how" className="py-12 scroll-mt-24" data-testid="how-section">
        <SolutionPillars />
      </section>

      {/* KPI / Stats Section */}
      <section id="kpis" className="py-12 px-6 scroll-mt-24" data-testid="kpis-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ThemedCard tone="brand" showSecurity={false} innerClassName="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-gradient shadow-neural">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">&lt;50ms</div>
                <div className="text-xs text-muted-foreground">Response Time</div>
              </div>
            </ThemedCard>
            <ThemedCard tone="brand" showSecurity={false} innerClassName="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-gradient shadow-neural">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-xs text-muted-foreground">PII Detection</div>
              </div>
            </ThemedCard>
            <ThemedCard tone="brand" showSecurity={false} innerClassName="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-gradient shadow-neural">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">60%</div>
                <div className="text-xs text-muted-foreground">Cost Reduction</div>
              </div>
            </ThemedCard>
            <ThemedCard tone="brand" showSecurity={false} innerClassName="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-gradient shadow-neural">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-xs text-muted-foreground">SOC Monitoring</div>
              </div>
            </ThemedCard>
            <ThemedCard tone="brand" showSecurity={false} innerClassName="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-gradient shadow-neural">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">∞</div>
                <div className="text-xs text-muted-foreground">Auto‑Scaling</div>
              </div>
            </ThemedCard>
          </div>
        </div>
      </section>

      {/* Case Studies Abschnitt entfernt */}

      {/* Hero-Komponente entfernt */}

      {/* Features Section with explicit ID and testid */}
      <section
        id="features"
        className="py-24 px-6 relative scroll-mt-24"
        data-testid="features-section"
      >
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-brand-mesh opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-display-sm font-bold text-foreground mb-6">
              {tLanding('features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {tLanding('features.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            <ThemedCard
              tone="brand"
              showSecurity={false}
              innerClassName="p-10 text-center h-full flex flex-col group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-brand-gradient shadow-quantum">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Firewall‑Powered AI</h3>
              <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
                Vor‑/Nachfilter mit PII‑Erkennung, Prompt‑Injection‑Schutz und Echtzeit‑Analyse.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-sm border border-brand-500/20">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                Patentangemeldet
              </div>
            </ThemedCard>

            <ThemedCard
              tone="brand"
              showSecurity={false}
              innerClassName="p-10 text-center h-full flex flex-col group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-brand-gradient shadow-quantum">
                <Eye className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Vollständige Audit‑Trails</h3>
              <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
                Jede Interaktion wird protokolliert und ist nachvollziehbar. Compliance durch
                umfassende Audits.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-sm border border-brand-500/20">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                Echtzeit‑Monitoring
              </div>
            </ThemedCard>

            <ThemedCard
              tone="brand"
              showSecurity={false}
              innerClassName="p-10 text-center h-full flex flex-col group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-brand-gradient shadow-quantum">
                <GitBranch className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Enterprise‑Compliance</h3>
              <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
                SOC 2 Type II, GDPR, HIPAA konform. Enterprise‑Security für regulierte Branchen.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-sm border border-brand-500/20">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                Industriestandards
              </div>
            </ThemedCard>
          </div>
        </div>
      </section>

      {/* Integrations with explicit ID and testid */}
      <section id="integrations" className="py-8 scroll-mt-24" data-testid="integrations-section">
        <Integrations />
      </section>

      {/* Workflow with explicit ID and testid */}
      <section id="workflow" className="py-4 scroll-mt-24" data-testid="workflow-section">
        <Workflow />
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-12 px-6 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {tLanding('useCases.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{tLanding('useCases.description')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => {
              const theme = getUseCaseBySlug(u.slug) ?? ('workflow' as UseCaseTheme);
              // Map UseCaseTheme -> ThemedTone
              const toneMap: Record<
                string,
                'firewall' | 'agents' | 'robotics' | 'appstore' | 'success' | 'danger' | 'brand'
              > = {
                government: 'brand',
                security: 'firewall',
                compliance: 'success',
                infrastructure: 'danger',
                finance: 'brand',
                healthcare: 'success',
                pharma: 'success',
                workflow: 'agents',
              };
              const tone = toneMap[theme] ?? 'brand';
              return (
                <ThemedCard
                  key={u.slug}
                  title={u.title}
                  description={u.excerpt}
                  href={withLocale(u.href)}
                  kpis={u.kpis?.length ? [u.kpis[0]] : undefined}
                  tone={tone}
                  showSecurity
                  innerClassName="h-full"
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits / Security Section */}
      <section id="security" className="py-20 px-6 bg-white dark:bg-slate-800 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {tLanding('benefits.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {tLanding('benefits.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Clock,
                title: 'Mehr als 40 Stunden pro Woche sparen',
                description: 'Automatisiere Routinearbeiten und fokussiere dich auf Wachstum',
                metric: '40+ Std. gespart',
              },
              {
                icon: DollarSign,
                title: 'Betriebskosten um 60% senken',
                description: 'KI‑Agenten arbeiten 24/7 – ohne Pausen',
                metric: '−60% Kosten',
              },
              {
                icon: TrendingUp,
                title: 'Umsatz um 35% steigern',
                description: 'Schnellere Ausführung und bessere Entscheidungen',
                metric: '+35% Umsatz',
              },
              {
                icon: Shield,
                title: '100% sicher & compliant',
                description: 'Enterprise‑Security mit SOC 2, GDPR und HIPAA',
                metric: '100% sicher',
              },
            ].map((benefit, index) => (
              <ThemedCard
                tone="brand"
                showSecurity={false}
                key={index}
                className="hover:-translate-y-1 transition-transform duration-300"
                innerClassName="p-8 text-center h-full flex flex-col"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-brand-gradient">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground mb-4">{benefit.description}</p>
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {benefit.metric}
                </div>
              </ThemedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-8 scroll-mt-24" data-testid="pricing-section">
        <Pricing />
      </section>

      {/* Testimonials & FAQ */}
      <section id="testimonials" className="py-8 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-2">
            <Testimonials />
            <FAQ />
          </div>
        </div>
      </section>

      {/* AI Chatbot mit Event-Handlern */}
      <AIChatbot onDemoRequest={handleDemoRequest} onContactRequest={handleContactRequest} />
    </main>
  );
}
