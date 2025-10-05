import { getDb } from '@/database/db';
import { subscriptions } from '@/database/schema/subscriptions';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { getServerAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PLAN_LABELS: Record<string, string> = {
  plan_free: 'Free',
  plan_starter: 'Starter',
  plan_pro: 'Pro',
  plan_business: 'Business',
  plan_enterprise: 'Enterprise',
};

function PlanBadge({ planId }: { planId: string }) {
  const label = PLAN_LABELS[planId] || planId;
  const highlight =
    planId === 'plan_free'
      ? 'bg-slate-200 text-slate-800'
      : 'bg-[color:var(--brand)] text-[color:var(--brand-foreground)]';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${highlight}`}
    >
      {label}
    </span>
  );
}

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const locale = params.locale;
  const prefix = `/${locale}`;
  const withLocale = (href: string) => {
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    if (href === '/') return prefix + '/';
    if (href.startsWith('/')) return `${prefix}${href}`;
    return `${prefix}/${href}`;
  };

  // Session und User ermitteln
  const session = await getServerAuthSession();
  const userId = session?.user?.id ? String(session.user.id) : null;

  const isSuccess = typeof searchParams?.success !== 'undefined';
  const isCanceled = typeof searchParams?.canceled !== 'undefined';

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Abrechnung</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Bitte melde dich an, um deine Abonnement-Informationen zu sehen.
        </p>
        <div className="mt-6">
          <Link className="rounded-lg border px-4 py-2 text-sm" href={withLocale('/auth/login')}>
            Zum Login
          </Link>
        </div>
      </main>
    );
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, String(userId)))
    .limit(1);

  const sub = rows[0] ?? null;
  const planId = sub?.planId || 'plan_free';
  const status = sub?.status || (planId === 'plan_free' ? 'active' : 'inactive');
  const hasPortal = !!sub?.externalCustomerId;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Abrechnung</h1>

      {isSuccess && (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-200">
          Kauf erfolgreich. Dein Abonnement ist aktiv.
        </div>
      )}
      {isCanceled && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-200">
          Zahlungsvorgang abgebrochen. Du kannst jederzeit erneut upgraden.
        </div>
      )}

      <section className="mt-6 rounded-xl border p-5">
        <h2 className="text-lg font-medium">Aktueller Plan</h2>
        <div className="mt-3 flex items-center gap-3">
          <PlanBadge planId={planId} />
          <span className="text-sm text-slate-600 dark:text-slate-300">Status: {status}</span>
        </div>
      </section>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-lg font-medium">Upgrade</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Du kannst jederzeit auf einen bezahlten Plan upgraden. Die Abrechnung erfolgt über unseren
          Zahlungsanbieter Stripe.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={withLocale('/pricing')}
            className="rounded-lg border px-4 py-2 text-sm"
            style={{ borderColor: 'var(--border)' }}
          >
            Preise ansehen
          </Link>
          <Link
            href={withLocale('/pricing#plans')}
            className="rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm text-[color:var(--brand-foreground)]"
          >
            Jetzt upgraden
          </Link>
          {hasPortal ? (
            <Link
              href={`/api/billing/portal?locale=${encodeURIComponent(locale)}`}
              className="rounded-lg border px-4 py-2 text-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              Abrechnung verwalten
            </Link>
          ) : (
            <span
              className="rounded-lg border px-4 py-2 text-sm text-slate-500 dark:text-slate-400"
              style={{ borderColor: 'var(--border)' }}
              title="Portal-Link verfügbar nach erster erfolgreichen Zahlung"
            >
              Abrechnung verwalten (bald verfügbar)
            </span>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-lg font-medium">Rechnungen</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Rechnungen stehen nach erfolgreicher Zahlung in deinem Stripe‑Kundenportal zur Verfügung.
        </p>
      </section>
    </main>
  );
}
