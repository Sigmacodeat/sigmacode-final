'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { pricing } from '@/content/landing';
import { Reveal } from '@/components/ui/Reveal';
import { NeonButton } from '@/components/ui/NeonButton';
import ThemedCard from '@/components/ui/ThemedCard';
import { analyticsUtils } from '@/app/lib/analytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { type Currency, planIdMap, convertCurrency, formatPrice } from '@/app/lib/pricing-utils';
import { FeatureMatrix } from '@/components/pricing/FeatureMatrix';
import { AddOnsTable } from '@/components/pricing/AddOnsTable';

export function Pricing() {
  const locale = useLocale();
  const t = useTranslations('pricingUI');
  const [yearly, setYearly] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const customLabel = locale === 'de' ? 'Individuell' : 'Custom';
  const displayUnit = locale === 'de' ? '/Monat' : '/month';

  const plans = useMemo(() => pricing.plans, []);

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
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg || 'Checkout fehlgeschlagen');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Preisformatierung erfolgt zentral über pricing-utils

  return (
    <section id={pricing.id} className="mx-auto max-w-7xl px-6 py-20 scroll-mt-24">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{pricing.title}</h2>
        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${!yearly ? 'bg-[color:var(--brand)] text-[color:var(--brand-foreground)]' : 'text-[color:var(--fg)]'}`}
            onClick={() => {
              setYearly(false);
              analyticsUtils.trackButtonClick('pricing_toggle_billing', {
                mode: 'monthly',
                placement: 'landing_pricing',
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
                placement: 'landing_pricing',
              });
            }}
            aria-pressed={yearly}
          >
            {pricing.billing.yearlyLabel}
          </button>
        </div>

        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${currency === 'EUR' ? 'bg-[color:var(--brand)] text-[color:var(--brand-foreground)]' : 'text-[color:var(--fg)]'}`}
            onClick={() => {
              setCurrency('EUR');
              analyticsUtils.trackButtonClick('pricing_toggle_currency', {
                currency: 'EUR',
                placement: 'landing_pricing',
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
                placement: 'landing_pricing',
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
        <div className="mx-auto max-w-3xl" aria-live="polite">
          <ErrorMessage title={t('errorCheckoutTitle')} message={errorMsg} />
        </div>
      )}

      {/* Plans */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {plans.map((p, i) => {
          const priceValue = convertCurrency(
            yearly ? (p.yearly as number | null) : (p.monthly as number | null),
            currency,
          );
          const pid = planIdMap[p.id] || p.id;
          return (
            <Reveal key={p.id} delayMs={i * 80}>
              <ThemedCard
                tone="brand"
                showSecurity={false}
                className={p.mostPopular ? 'ring-1 ring-brand-600/30 relative' : 'relative'}
                innerClassName="p-6 flex h-full flex-col"
              >
                {p.mostPopular && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-20"
                    style={{
                      background:
                        'radial-gradient(120% 60% at 50% -20%, color-mix(in oklab, var(--brand) 30%, transparent) 0%, transparent 60%)',
                    }}
                  />
                )}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-foreground">{p.name}</div>
                  {(p.badge || p.mostPopular) && (
                    <span className="rounded-full bg-[color:var(--brand)] px-2 py-0.5 text-[11px] text-[color:var(--brand-foreground)]">
                      {p.mostPopular ? t('recommendedBadge') : p.badge}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                )}
                <div className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
                  {formatPrice(priceValue as number | null, currency, displayUnit, customLabel)}
                </div>
                {yearly && p.monthly !== null && p.yearly !== null && (p.monthly as number) > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
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
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {p.bullets.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.cta &&
                  (p.monthly !== null ? (
                    <NeonButton
                      variant={p.mostPopular ? 'accent' : 'secondary'}
                      size="md"
                      className="mt-6"
                      onClick={() => {
                        analyticsUtils.trackButtonClick('pricing_plan_cta', {
                          plan: p.id,
                          placement: 'landing_pricing',
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
                    </NeonButton>
                  ) : (
                    <Link
                      href={p.cta.href || '/contact'}
                      className="mt-6 inline-block"
                      onClick={() =>
                        analyticsUtils.trackButtonClick('pricing_plan_cta', {
                          plan: p.id,
                          placement: 'landing_pricing',
                          yearly,
                          currency,
                        })
                      }
                    >
                      <NeonButton variant="secondary" size="md">
                        {p.cta.label || t('contact')}
                      </NeonButton>
                    </Link>
                  ))}
                <div className="mt-2 text-xs text-muted-foreground">
                  {yearly ? t('ctaYearlyNote') : t('ctaMonthlyNote')}
                </div>
              </ThemedCard>
            </Reveal>
          );
        })}
      </div>

      {/* Feature Matrix */}
      <div className="mt-14">
        <FeatureMatrix />
      </div>

      {/* Add-ons & Usage */}
      {pricing.addOns && (
        <div className="mt-12">
          <AddOnsTable />
        </div>
      )}
    </section>
  );
}
