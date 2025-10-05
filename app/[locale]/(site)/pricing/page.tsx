'use client';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useMemo, useState, useEffect } from 'react';
import { pricing } from '@/content/landing';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { analyticsUtils } from '@/app/lib/analytics';
import { type Currency, planIdMap, convertCurrency, formatPrice } from '@/app/lib/pricing-utils';
import { FeatureMatrix } from '@/components/pricing/FeatureMatrix';
import { AddOnsTable } from '@/components/pricing/AddOnsTable';

export default function PricingPage() {
  const locale = useLocale();
  const t = useTranslations('pricingUI');
  const prefix = `/${locale}`;
  const withLocale = (href: string) => {
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    if (href === '/') return prefix + '/';
    if (href.startsWith('/#')) return `${prefix}${href}`;
    return `${prefix}${href}`;
  };

  const [yearly, setYearly] = useState(false);
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const customLabel = locale === 'de' ? 'Individuell' : 'Custom';
  const displayUnit = locale === 'de' ? '/Monat' : '/month';

  const plans = useMemo(() => pricing.plans as typeof pricing.plans, []);

  useEffect(() => setLoadingPlan(null), []);

  const startCheckout = async (planKey: string) => {
    const planId = planIdMap[planKey] || planKey;
    setLoadingPlan(planId);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ planId, billing: yearly ? 'yearly' : 'monthly', locale }),
      });
      const data = (await response.json().catch(() => ({}) as any)) as {
        error?: string;
        url?: string;
      };
      if (!response.ok) throw new Error(data?.error || 'Checkout fehlgeschlagen');
      if (data?.url) window.location.href = data.url as string;
    } catch (e) {
      console.error(e);
      setErrorMsg((e as Error).message || 'Checkout fehlgeschlagen');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Währungsumrechnung/Formatierung zentral über pricing-utils

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 space-y-12">
      {/* Hero */}
      <header className="text-center space-y-4">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
          style={{
            border: '1px solid var(--brand-600)',
            color: 'var(--brand-600)',
            background: 'color-mix(in oklab, var(--brand) 8%, transparent)',
          }}
        >
          SIGMACODE Neural Firewall
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          {pricing.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Starte kostenlos und skaliere sicher. SOC 2-bereit, Enterprise-Features bei Bedarf.
        </p>
        <div
          className="mt-2 inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${!yearly ? 'bg-[color:var(--brand)] text-[color:var(--brand-foreground)]' : 'text-[color:var(--fg)]'}`}
            onClick={() => {
              setYearly(false);
              analyticsUtils.trackButtonClick('pricing_toggle_billing', {
                mode: 'monthly',
                placement: 'pricing_page',
              });
            }}
            aria-pressed={!yearly}
          >
            {pricing.billing.monthlyLabel}
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${yearly ? 'bg-[color:var(--brand)] text-[color:var(--brand-foreground)]' : 'text-[color:var(--fg)]'}`}
            onClick={() => {
              setYearly(true);
              analyticsUtils.trackButtonClick('pricing_toggle_billing', {
                mode: 'yearly',
                placement: 'pricing_page',
              });
            }}
            aria-pressed={yearly}
          >
            {pricing.billing.yearlyLabel}
          </button>
        </div>

        <div
          className="mt-2 inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${currency === 'EUR' ? 'bg-[color:var(--brand)] text-[color:var(--brand-foreground)]' : 'text-[color:var(--fg)]'}`}
            onClick={() => {
              setCurrency('EUR');
              analyticsUtils.trackButtonClick('pricing_toggle_currency', {
                currency: 'EUR',
                placement: 'pricing_page',
              });
            }}
            aria-pressed={currency === 'EUR'}
          >
            EUR
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${currency === 'USD' ? 'bg-[color:var(--brand)] text-[color:var(--brand-foreground)]' : 'text-[color:var(--fg)]'}`}
            onClick={() => {
              setCurrency('USD');
              analyticsUtils.trackButtonClick('pricing_toggle_currency', {
                currency: 'USD',
                placement: 'pricing_page',
              });
            }}
            aria-pressed={currency === 'USD'}
          >
            USD
          </button>
        </div>
      </header>

      {/* Fehlerbox */}
      {errorMsg && (
        <div className="max-w-3xl mx-auto" aria-live="polite">
          <ErrorMessage title={t('errorCheckoutTitle')} message={errorMsg} />
        </div>
      )}

      {/* Plans */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {plans.map((p: (typeof pricing.plans)[number]) => {
          const priceValue = convertCurrency(
            yearly ? (p.yearly as number | null) : (p.monthly as number | null),
            currency,
          );
          const pid = planIdMap[p.id] ?? p.id;
          const isCheckout = p.monthly !== null; // Enterprise ist null => Kontakt
          return (
            <div
              key={p.id}
              className={`relative flex h-full flex-col rounded-2xl border p-6 transition-transform hover:-translate-y-0.5 ${p.mostPopular ? 'ring-2 ring-offset-2 ring-offset-[color:var(--card)] ring-[color:var(--brand-600)] shadow-lg' : 'shadow-sm'}`}
              style={{
                borderColor: p.mostPopular ? 'var(--brand-600)' : 'var(--border)',
                background: p.mostPopular
                  ? 'color-mix(in oklab, var(--brand) 8%, var(--card))'
                  : 'var(--card)',
              }}
            >
              {p.mostPopular && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-15"
                  style={{
                    background:
                      'radial-gradient(120% 60% at 50% -20%, color-mix(in oklab, var(--brand) 30%, transparent) 0%, transparent 60%)',
                  }}
                />
              )}
              {(p.badge || p.mostPopular) && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--brand)] px-3 py-1 text-xs font-medium text-[color:var(--brand-foreground)]">
                  {p.mostPopular ? t('recommendedBadge') : p.badge}
                </span>
              )}
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{p.name}</div>
              {p.description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
              )}
              <div className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatPrice(priceValue as number | null, currency, displayUnit, customLabel)}
              </div>
              {yearly && p.monthly !== null && p.yearly !== null && (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="mr-2 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                    {t('savingPercent', {
                      percent: Math.round(pricing.billing.yearlyDiscount * 100),
                    })}
                  </span>
                  <span className="mr-2 rounded-full bg-sky-500/10 px-2 py-0.5 font-medium text-sky-700 dark:text-sky-300">
                    {t('effectiveBadge', {
                      price: formatPrice(
                        convertCurrency(Math.round((p.yearly as number) / 12), currency),
                        currency,
                        displayUnit,
                        customLabel,
                      ),
                    })}
                  </span>
                  <span className="line-through opacity-60">
                    {formatPrice(
                      convertCurrency(p.monthly as number, currency),
                      currency,
                      displayUnit,
                      customLabel,
                    )}
                  </span>
                </div>
              )}
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {p.bullets.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-1 gap-3">
                {isCheckout ? (
                  <button
                    className={`rounded-lg py-2 text-sm ${p.mostPopular ? 'bg-[color:var(--brand)] text-[color:var(--brand-foreground)] hover:brightness-105' : 'border hover:bg-[color:var(--muted)]/40'}`}
                    style={!p.mostPopular ? { borderColor: 'var(--border)' } : undefined}
                    onClick={() => {
                      analyticsUtils.trackButtonClick('pricing_plan_cta', {
                        plan: p.id,
                        placement: 'pricing_page',
                        yearly,
                        currency,
                      });
                      startCheckout(p.id);
                    }}
                    disabled={!!loadingPlan}
                  >
                    {loadingPlan === pid ? (
                      <span className="inline-flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        {t('opening')}
                      </span>
                    ) : (
                      (p.cta?.label ?? t('select'))
                    )}
                  </button>
                ) : (
                  <Link
                    className="rounded-lg py-2 text-sm text-center border hover:bg-[color:var(--muted)]/40"
                    style={{ borderColor: 'var(--border)' }}
                    href={withLocale('/contact')}
                    onClick={() =>
                      analyticsUtils.trackButtonClick('pricing_plan_cta', {
                        plan: p.id,
                        placement: 'pricing_page',
                        yearly,
                        currency,
                      })
                    }
                  >
                    {t('contact')}
                  </Link>
                )}
                {/* CTA-Microcopy */}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {yearly ? t('ctaYearlyNote') : t('ctaMonthlyNote')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Matrix */}
      <FeatureMatrix title="Feature‑Vergleich" />

      {/* Schema.org OfferCatalog */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'OfferCatalog',
            name: 'SIGMACODE Plans',
            itemListElement: plans.map((p) => ({
              '@type': 'Offer',
              name: p.name,
              priceCurrency: currency,
              price:
                p.monthly == null
                  ? undefined
                  : convertCurrency(
                      yearly ? (p.yearly as number) : (p.monthly as number),
                      currency,
                    ),
              url: p.cta?.href || '/contact',
              category: 'SoftwareApplication',
              availability: 'https://schema.org/InStock',
              priceSpecification:
                p.monthly == null
                  ? undefined
                  : {
                      '@type': 'UnitPriceSpecification',
                      priceCurrency: currency,
                      price: convertCurrency(
                        yearly ? (p.yearly as number) : (p.monthly as number),
                        currency,
                      ),
                      unitText: 'MONTH',
                    },
            })),
          }),
        }}
      />

      {/* Add-ons & Usage */}
      {pricing.addOns && <AddOnsTable />}

      {/* FAQ */}
      <section
        className="rounded-xl border p-6"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Häufige Fragen
        </h2>
        <div className="space-y-4">
          <details className="group">
            <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
              Gibt es eine kostenlose Testphase?
            </summary>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Ja, mit dem Free/Starter Plan kannst du sofort starten und später upgraden.
            </p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
              Kann ich jederzeit kündigen?
            </summary>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Ja, monatlich kündbar. Jährliche Abrechnung bietet 20% Rabatt.
            </p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
              Bietet ihr On‑Premise an?
            </summary>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Ja, im Enterprise‑Plan: On‑Premise/Private Cloud, SLAs und dedizierter Support.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
