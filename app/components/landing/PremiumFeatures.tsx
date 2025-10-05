'use client';

import { useState, useMemo, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { NeonButton } from '@/components/ui';
import ThemedCard from '@/components/ui/ThemedCard';
import {
  Shield,
  Zap,
  Database,
  Cpu,
  Lock,
  Activity,
  Server,
  Eye,
  Layers,
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  Users,
  FileText,
} from 'lucide-react';

interface Feature {
  i18nKey: string; // key unter landing.premiumFeatures.items.<i18nKey>
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  technical: string[];
  metrics?: string[];
  category: 'security' | 'performance' | 'architecture' | 'monitoring';
}

const features: Feature[] = [
  {
    i18nKey: 'firewall',
    icon: Shield,
    title: 'AI Firewall Protection',
    subtitle: 'Sub-50ms Real-time Filtering',
    description: 'Echtzeit-Filterung von AI-Prompts und -Responses mit militärischer Genauigkeit.',
    technical: [
      'Pre/Post filtering pipeline',
      'Content validation & sanitization',
      'Rate limiting & throttling',
      'RBAC & access control',
      'Anomaly detection',
      'Threat intelligence integration',
      'Kong API Gateway (mTLS, routing, rate limits)',
    ],
    metrics: ['<50ms latency', '99.9% accuracy', '0 false positives'],
    category: 'security',
  },
  {
    i18nKey: 'gateway',
    icon: Server,
    title: 'API Gateway (Kong)',
    subtitle: 'TLS • Routing • Rate Limits',
    description: 'Sichere, zentral gesteuerte API-Ebene für alle Agent- und Workflow-Requests.',
    technical: [
      'mTLS termination & TLS enforcement',
      'Declarative routing & service discovery',
      'Global/Route rate limiting',
      'AuthN/Z integrations (keys, JWT, OIDC)',
      'Observability hooks (logs, metrics)',
      'Edge-ready deployments',
    ],
    metrics: ['<5ms gateway overhead', 'Global policies', 'Zero-trust ready'],
    category: 'security',
  },
  {
    i18nKey: 'orchestration',
    icon: Cpu,
    title: 'Multi-Agent Orchestration',
    subtitle: 'Intelligent Load Balancing',
    description: 'Nahtlose Koordination zwischen Dify, Superagent und proprietären AI-Modellen.',
    technical: [
      'Parallel processing architecture',
      'Intelligent routing algorithms',
      'Failover mechanisms',
      'Load distribution optimization',
      'Context preservation',
      'Real-time synchronization',
    ],
    metrics: ['<100ms orchestration', '99.5% uptime', '50+ models'],
    category: 'architecture',
  },
  {
    i18nKey: 'auditTrail',
    icon: Database,
    title: 'Immutable Audit Trail',
    subtitle: 'GDPR & SOC 2 Compliant',
    description:
      'Vollständige Nachverfolgung aller AI-Interaktionen mit unveränderlicher Protokollierung.',
    technical: [
      'Cryptographic signatures',
      'Tamper-proof logging',
      'Real-time indexing',
      'Advanced search capabilities',
      'Export & compliance tools',
      'Retention policies',
    ],
    metrics: ['256-bit encryption', 'Instant search', '7-year retention'],
    category: 'security',
  },
  {
    i18nKey: 'monitoring',
    icon: Activity,
    title: 'Real-time Monitoring',
    subtitle: 'Live Metrics Dashboard',
    description: 'Umfassende Überwachung aller Systemkomponenten mit Echtzeit-Analytics.',
    technical: [
      'Live event streaming',
      'Performance metrics',
      'Error tracking & alerting',
      'Resource utilization',
      'Custom dashboards',
      'Historical analysis',
    ],
    metrics: ['1ms granularity', '30-day retention', '100+ metrics'],
    category: 'monitoring',
  },
  {
    i18nKey: 'latency',
    icon: Zap,
    title: 'Ultra-low Latency',
    subtitle: 'Enterprise Performance',
    description: 'Optimierte Infrastruktur für maximale Geschwindigkeit und minimale Latenz.',
    technical: [
      'Edge computing deployment',
      'CDN integration',
      'Database query optimization',
      'Caching strategies',
      'Compression algorithms',
      'Network optimization',
    ],
    metrics: ['<100ms global', '99.99% uptime', '10Gbps throughput'],
    category: 'performance',
  },
  {
    i18nKey: 'zerotrust',
    icon: Lock,
    title: 'Zero-Trust Security',
    subtitle: 'Military-Grade Protection',
    description: 'Mehrschichtige Sicherheitsarchitektur mit kontinuierlicher Validierung.',
    technical: [
      'Identity verification',
      'Access token management',
      'Session management',
      'API security',
      'Data encryption at rest',
      'Network segmentation',
    ],
    metrics: ['SOC 2 Type II', 'ISO 27001', 'GDPR compliant'],
    category: 'security',
  },
];

const categoryIcons = {
  security: Shield,
  performance: Zap,
  architecture: Layers,
  monitoring: Activity,
};

const categoryColors = {
  // Security: Neon Cyan -> Deep Blue
  security: 'from-[#00F6FF] to-[#0A1F44]',
  // Performance: Amber -> Red
  performance: 'from-[#F59E0B] to-[#EF4444]',
  // Architecture: Violet -> Cyan
  architecture: 'from-[#8B5CF6] to-[#06B6D4]',
  // Monitoring: Emerald -> Blue
  monitoring: 'from-[#10B981] to-[#3B82F6]',
};

export function PremiumFeatures() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('landing.premiumFeatures');

  // Safe i18n lookup with fallback
  const tOpt = (key: string, fallback: string) => {
    try {
      const v = t(key as any);
      return v || fallback;
    } catch {
      return fallback;
    }
  };

  const categories = ['all', ...Array.from(new Set(features.map((f) => f.category)))];

  const filteredFeatures = useMemo(
    () =>
      selectedCategory === 'all'
        ? features
        : features.filter((f) => f.category === selectedCategory),
    [selectedCategory],
  );

  const onCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, title: string, isExpanded: boolean) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpandedFeature(isExpanded ? null : title);
    }
  };

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--bg) 0%, color-mix(in oklab, var(--card) 80%, transparent) 50%, var(--bg) 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Premium Badge with gradient border + glass + shimmer */}
          <div className="relative inline-flex rounded-full p-[1.5px] bg-gradient-to-r from-[var(--brand-start)] via-[color-mix(in_oklab,var(--brand)_40%,transparent)] to-[var(--brand-end)] shadow-[0_0_24px_-8px_var(--brand)]">
            <span
              className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-md"
              style={{
                background: 'color-mix(in oklab, var(--card) 85%, transparent)',
                color: 'var(--brand-300)',
                boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <Layers className="h-4 w-4" />
              {t('headerBadge')}
            </span>
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

          {/* Title */}
          <h2
            className="mt-6 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance"
            style={{ color: 'var(--fg)', textShadow: '0 2px 16px rgba(0,246,255,0.12)' }}
          >
            {t('headerTitleLead')}
            <span className="block neural-gradient-text drop-shadow-[0_6px_28px_rgba(0,246,255,0.25)]">
              {t('headerTitleStrong')}
            </span>
          </h2>

          {/* Accent line */}
          <div className="mx-auto mt-4 h-[2px] w-40 rounded-full bg-gradient-to-r from-[var(--brand-start)] via-[color-mix(in_oklab,var(--brand)_45%,transparent)] to-[var(--brand-end)] opacity-70"></div>

          <p
            className="mt-6 text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {t('headerSubtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Layers;
            const isSelected = selectedCategory === category;
            const gradient =
              category === 'all'
                ? 'from-[var(--brand-start)] to-[var(--brand-end)]'
                : categoryColors[category as keyof typeof categoryColors];
            const label =
              category === 'all'
                ? t('categories.all')
                : category === 'security'
                  ? t('categories.security')
                  : category === 'performance'
                    ? t('categories.performance')
                    : category === 'architecture'
                      ? t('categories.architecture')
                      : t('categories.monitoring');

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand)] ${
                  isSelected
                    ? `bg-gradient-to-r ${gradient} text-white shadow-lg shadow-[var(--brand)]/25`
                    : 'border hover:border-[var(--brand)] hover:bg-[var(--brand)]/5'
                }`}
                style={
                  isSelected
                    ? { borderColor: 'transparent' }
                    : {
                        borderColor: 'var(--border)',
                        color: 'var(--fg)',
                        backgroundColor: 'var(--card)',
                      }
                }
              >
                <IconComponent className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature: Feature, index: number) => {
            const IconComponent = feature.icon as unknown as React.ElementType | undefined;
            const title = tOpt(`items.${feature.i18nKey}.title`, feature.title);
            const subtitle = tOpt(`items.${feature.i18nKey}.subtitle`, feature.subtitle);
            const isExpanded = expandedFeature === feature.title;
            const contentId = `feature-${feature.i18nKey}`;
            const gradientColors =
              categoryColors[feature.category] ?? 'from-[var(--brand-start)] to-[var(--brand-end)]';
            const SafeIcon =
              IconComponent && typeof IconComponent === 'function' ? IconComponent : Layers;

            return (
              <ThemedCard
                tone="brand"
                showSecurity={false}
                key={feature.title}
                className="group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                onClick={() => setExpandedFeature(isExpanded ? null : feature.title)}
                innerClassName="hover:scale-105 hover:shadow-2xl"
              >
                <motion.div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  className="p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] rounded-2xl"
                  onKeyDown={(evt: React.KeyboardEvent<HTMLDivElement>) =>
                    onCardKeyDown(evt, feature.title, isExpanded)
                  }
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: prefersReducedMotion ? 0 : index * 0.04,
                    ease: 'easeOut',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientColors} shadow-lg`}
                    >
                      <SafeIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
                        {title}
                      </h3>
                      <p className="text-sm font-medium" style={{ color: 'var(--brand-600)' }}>
                        {subtitle}
                      </p>
                    </div>
                    <ArrowRight
                      className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                  </div>

                  {/* Description */}
                  <p className="mb-6 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {feature.description}
                  </p>

                  {/* Metrics */}
                  {Array.isArray(feature.metrics) && feature.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6" aria-label="Feature metrics">
                      {feature.metrics.map((metric: string, idx: number) => (
                        <motion.span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: 'color-mix(in oklab, var(--brand) 15%, transparent)',
                            color: 'var(--brand-600)',
                          }}
                          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                          whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{
                            duration: 0.3,
                            delay: prefersReducedMotion ? 0 : idx * 0.05,
                          }}
                        >
                          <CheckCircle className="h-3 w-3" style={{ color: 'var(--brand-600)' }} />
                          {metric}
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Technical Details */}
                  <div
                    id={contentId}
                    aria-hidden={!isExpanded}
                    className={`transition-[max-height,opacity] duration-500 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                      <h4
                        className="font-semibold mb-3 flex items-center gap-2"
                        style={{ color: 'var(--fg)' }}
                      >
                        <FileText className="h-4 w-4" />
                        {t('technicalImplementation')}
                      </h4>
                      <ul className="space-y-2">
                        {(Array.isArray(feature.technical) ? feature.technical : []).map(
                          (tech: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              <div
                                className="h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: 'var(--brand-600)' }}
                              />
                              {tech}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    <NeonButton variant="ghost" size="sm" className="w-full group/btn">
                      {t('docButton')}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </NeonButton>
                  </div>
                </motion.div>
              </ThemedCard>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div
            className="inline-flex items-center gap-3 rounded-full border px-6 py-3 shadow-lg"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--muted-foreground)',
            }}
          >
            <Users className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
            <span className="text-sm font-medium">{t('trustedBy')}</span>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <NeonButton variant="neon" size="lg" className="group">
              {t('startFree')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NeonButton>

            <NeonButton
              variant="ghost"
              size="lg"
              style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
            >
              {t('scheduleDemo')}
              <Globe className="h-5 w-5" />
            </NeonButton>
          </div>
        </div>
      </div>
    </section>
  );
}
