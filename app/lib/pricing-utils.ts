export type Currency = 'EUR' | 'USD';

const FX_ENV = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_EUR_TO_USD : undefined;
const FX_PARSED = FX_ENV ? Number.parseFloat(FX_ENV) : NaN;
export const EUR_TO_USD = Number.isFinite(FX_PARSED) && FX_PARSED > 0 ? FX_PARSED : 1.08; // Fallback

export const planIdMap: Record<string, string> = {
  free: 'plan_free',
  starter: 'plan_starter',
  pro: 'plan_pro',
  business: 'plan_business',
  enterprise: 'plan_enterprise',
};

export function convertCurrency(value: number | null, currency: Currency): number | null {
  if (value === null) return null;
  return currency === 'USD' ? Math.round(value * EUR_TO_USD) : value;
}

export function formatPrice(
  value: number | null,
  currency: Currency,
  unit: string,
  customLabel = 'Individuell',
): string {
  if (value === null) return customLabel;
  const nfLocale = currency === 'USD' ? 'en-US' : 'de-DE';
  const formatted = new Intl.NumberFormat(nfLocale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('\u00a0', ' ');
  return unit ? `${formatted} ${unit}` : formatted;
}
