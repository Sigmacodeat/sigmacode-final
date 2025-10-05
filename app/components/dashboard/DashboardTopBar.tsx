'use client';

import Link from 'next/link';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/dashboard/LanguageSwitcher';

export function DashboardTopBar() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || '';
  const t = useTranslations('dashboard.layout');

  function goBack() {
    // Versuch, zur vorherigen Seite zu gehen; Fallback auf Dashboard-Home
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
        return;
      }
    } catch {}
    router.push(`/${locale}/dashboard`);
  }

  // Einfacher Seitentitel
  const pageTitle = 'Dashboard';

  return (
    <div
      className="mb-6 flex items-center gap-3 justify-between border-b pb-3"
      role="region"
      aria-label="Dashboard Kopfbereich"
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={goBack}
          aria-label={t('back') ?? 'Back'}
          className="shrink-0 inline-flex items-center justify-center h-9 px-3 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-semibold truncate text-foreground">{pageTitle}</h1>
          <div className="hidden sm:block">
            <DashboardBreadcrumbs />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Optional: Sekundärlink zur Dashboard-Startseite */}
        <Link
          href={`/${locale}/dashboard`}
          className="hidden sm:inline text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          {t('home') ?? 'Dashboard'}
        </Link>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}
