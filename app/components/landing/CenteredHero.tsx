'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { NeonButton } from '@/components/ui/NeonButton';
import { PremiumTrustBadge } from '@/components/landing/PremiumTrustBadge';
import { analyticsUtils, getAnalytics } from '@/app/lib/analytics';
import {
  Sparkles,
  ChevronRight,
  ArrowRight,
  Shield,
  Zap,
  Award,
  Target,
  CheckCircle,
  Clock,
  Database,
  Lock,
} from 'lucide-react';

export function CenteredHero() {
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

  const prefersReducedMotion = useReducedMotion();

  // View tracking for badges and logos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const type = el.dataset.analytics;
            const label = el.dataset.label || 'unknown';
            if (type === 'badge') {
              getAnalytics().trackEvent({
                name: 'trust_badge_view',
                category: 'view',
                action: 'view',
                label,
              });
            } else if (type === 'logo') {
              getAnalytics().trackEvent({
                name: 'logo_view',
                category: 'view',
                action: 'view',
                label,
              });
            }
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );

    document
      .querySelectorAll('[data-analytics="badge"], [data-analytics="logo"]')
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      data-testid="centered-hero"
      style={{ background: 'var(--mesh-brand)' }}
    >
      {/* Advanced Mesh Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl lg:max-w-6xl px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-14 text-center">
        {/* Premium Badge with gradient border + glass + shimmer */}
        <div className="relative inline-flex rounded-full p-[1.5px] bg-gradient-to-r from-[var(--brand-start)] via-[color-mix(in_oklab,var(--brand)_40%,transparent)] to-[var(--brand-end)] shadow-[0_0_24px_-8px_var(--brand)]">
          <Link
            href={withLocale('/#how')}
            className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand)]"
            style={{
              background: 'color-mix(in oklab, var(--card) 85%, transparent)',
              color: 'var(--brand-300)',
              boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)',
            }}
            aria-label="So funktioniert das Quantum Neural Shield"
            onClick={() =>
              analyticsUtils.trackButtonClick('hero_badge_click', {
                section: 'hero',
                target: 'how',
              })
            }
          >
            <Sparkles className="h-4 w-4" /> Quantum Neural Shield
          </Link>
          {/* shimmer overlay */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
              filter: 'blur(2px)',
              opacity: 0,
            }}
            initial={false}
            animate={prefersReducedMotion ? {} : { x: ['-120%', '120%'], opacity: [0, 0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <h1 className="mt-6 text-display-md sm:text-display-lg md:text-display-xl font-extrabold tracking-tightest text-foreground leading-[1.05] pb-2 max-w-4xl sm:max-w-5xl md:max-w-6xl mx-auto text-balance">
          Neural Firewall für
          <span
            className="block bg-gradient-brand bg-clip-text text-transparent"
            style={{ backgroundSize: '200% auto' }}
          >
            AI‑Agents & Workflows
          </span>
        </h1>

        {/* Accent line with glow */}
        <div className="mx-auto mt-4 h-[2px] w-32 rounded-full bg-gradient-brand opacity-80 shadow-glow-electric"></div>

        <p className="mt-2 text-sm sm:text-base md:text-lg font-medium tracking-tight mx-auto text-muted-foreground">
          <span className="text-destructive">Unsecured</span> →{' '}
          <span className="text-brand-electric">Firewall</span> →{' '}
          <span className="text-success">Protected</span>
        </p>

        <p
          className="mt-4 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Baue, orchestriere und betreibe AI‑Agenten & Workflows – abgesichert durch unsere Neural
          AI Firewall. Sub‑100ms Latenz, Enterprise‑Security und sofort einsatzbereit.
        </p>

        <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center mx-auto">
          <Link
            href={withLocale('/register')}
            className="inline-flex"
            aria-label="Kostenlos starten"
          >
            <NeonButton
              variant="accent"
              size="lg"
              className="group px-7 sm:px-9 md:px-10 py-3.5 sm:py-4.5 md:py-5 text-base sm:text-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand)]"
              onClick={() =>
                analyticsUtils.trackButtonClick('signup_cta', {
                  section: 'hero',
                  layout: 'centered',
                })
              }
            >
              Kostenlos starten
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </NeonButton>
          </Link>
          <Link href={withLocale('/contact')} className="inline-flex" aria-label="Demo buchen">
            <NeonButton
              variant="ghost"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-6 sm:px-8 md:px-9 py-3 sm:py-4 md:py-4.5 text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand)]"
              onClick={() =>
                analyticsUtils.trackButtonClick('demo_cta', { section: 'hero', layout: 'centered' })
              }
            >
              Demo buchen
              <ArrowRight className="h-4 w-4" />
            </NeonButton>
          </Link>
        </div>

        {/* Reassurance unter CTAs */}
        <div
          className="mt-4 md:mt-5 flex flex-wrap items-center justify-center gap-x-6 md:gap-x-8 gap-y-2 text-[11px] sm:text-xs px-4 md:px-0"
          style={{ color: 'color-mix(in oklab, var(--fg) 60%, transparent)' }}
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-brand-400" />
            Keine Kreditkarte erforderlich
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-400" />
            In 2 Minuten startklar
          </span>
          <span className="inline-flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-400" />
            SOC 2 • ISO 27001
          </span>
          <Link
            href={withLocale('/firewall')}
            className="inline-flex items-center gap-2 underline-offset-2 hover:underline"
            onClick={() =>
              analyticsUtils.trackButtonClick('architecture_view', {
                section: 'hero',
                layout: 'centered',
              })
            }
          >
            Architektur ansehen
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 sm:mt-12 md:mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-4 mx-auto max-w-5xl px-4 md:px-0">
          <div data-analytics="badge" data-label="soc2">
            <PremiumTrustBadge
              icon={<Award className="h-4 w-4" />}
              topLabel="Zertifiziert"
              title="SOC 2 Type II"
              variant="soc2"
            />
          </div>
          <div data-analytics="badge" data-label="iso">
            <PremiumTrustBadge
              icon={<Shield className="h-4 w-4" />}
              topLabel="Compliant"
              title="ISO 27001"
              variant="iso"
            />
          </div>
          <div data-analytics="badge" data-label="uptime">
            <PremiumTrustBadge
              icon={<Target className="h-4 w-4" />}
              topLabel="SLA"
              title="99.9% Uptime"
              variant="uptime"
            />
          </div>
          <div data-analytics="badge" data-label="latency">
            <PremiumTrustBadge
              icon={<Zap className="h-4 w-4" />}
              topLabel="Response"
              title="<50ms Latenz"
              variant="latency"
            />
          </div>
        </div>

        {/* Secondary Trust Row (compact) */}
        <div className="mt-3 sm:mt-4 md:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-3.5 sm:grid-cols-4 mx-auto max-w-5xl px-4 md:px-0">
          <div data-analytics="badge" data-label="dsgvo">
            <PremiumTrustBadge
              icon={<Shield className="h-4 w-4" />}
              topLabel="Compliant"
              title="DSGVO"
              variant="iso"
              size="sm"
              onClick={() =>
                analyticsUtils.trackButtonClick('trust_badge_click', {
                  badge: 'dsgvo',
                  layout: 'centered',
                })
              }
            />
          </div>
          <div data-analytics="badge" data-label="hipaa">
            <PremiumTrustBadge
              icon={<Shield className="h-4 w-4" />}
              topLabel="Compliant"
              title="HIPAA"
              variant="iso"
              size="sm"
              onClick={() =>
                analyticsUtils.trackButtonClick('trust_badge_click', {
                  badge: 'hipaa',
                  layout: 'centered',
                })
              }
            />
          </div>
          <div data-analytics="badge" data-label="audit_trails">
            <PremiumTrustBadge
              icon={<Database className="h-4 w-4" />}
              topLabel="Immutable"
              title="Audit‑Trails"
              variant="soc2"
              size="sm"
              onClick={() =>
                analyticsUtils.trackButtonClick('trust_badge_click', {
                  badge: 'audit_trails',
                  layout: 'centered',
                })
              }
            />
          </div>
          <div data-analytics="badge" data-label="rbac">
            <PremiumTrustBadge
              icon={<Lock className="h-4 w-4" />}
              topLabel="Access Control"
              title="RBAC"
              variant="custom"
              size="sm"
              onClick={() =>
                analyticsUtils.trackButtonClick('trust_badge_click', {
                  badge: 'rbac',
                  layout: 'centered',
                })
              }
            />
          </div>
        </div>
        {/* Social Proof Logo Band */}
        <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8 opacity-90 mx-auto max-w-6xl px-4 md:px-0">
          <span
            className="text-[11px] sm:text-xs uppercase tracking-widest"
            style={{ color: 'color-mix(in oklab, var(--fg) 55%, transparent)' }}
          >
            Trusted by
          </span>
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            <img
              src="/logos/stripe.svg"
              alt="Stripe"
              className="h-5 sm:h-6 md:h-7 opacity-80 grayscale hover:grayscale-0 transition"
              loading="lazy"
              width={88}
              height={24}
              data-analytics="logo"
              data-label="stripe"
            />
            <img
              src="/logos/cloudflare.svg"
              alt="Cloudflare"
              className="h-5 sm:h-6 md:h-7 opacity-80 grayscale hover:grayscale-0 transition"
              loading="lazy"
              width={120}
              height={24}
              data-analytics="logo"
              data-label="cloudflare"
            />
            <img
              src="/logos/vercel.svg"
              alt="Vercel"
              className="h-4 sm:h-5 md:h-6 opacity-80 grayscale hover:grayscale-0 transition"
              loading="lazy"
              width={90}
              height={22}
              data-analytics="logo"
              data-label="vercel"
            />
            <img
              src="/logos/supabase.svg"
              alt="Supabase"
              className="h-4 sm:h-5 md:h-6 opacity-80 grayscale hover:grayscale-0 transition"
              loading="lazy"
              width={110}
              height={22}
              data-analytics="logo"
              data-label="supabase"
            />
            <img
              src="/logos/github.svg"
              alt="GitHub"
              className="h-5 sm:h-6 md:h-7 opacity-80 grayscale hover:grayscale-0 transition"
              loading="lazy"
              width={24}
              height={24}
              data-analytics="logo"
              data-label="github"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
