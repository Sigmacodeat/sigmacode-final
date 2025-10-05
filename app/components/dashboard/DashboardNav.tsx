'use client';

/**
 * SIGMACODE AI - Premium Dashboard Navigation
 *
 * Hauptnavigation für Dashboard mit Agent-Management, Firewall, etc.
 * Design: Glassmorphism Sidebar, Smooth Transitions, Premium Aesthetics
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Brain,
  Workflow,
  Shield,
  Settings,
  BarChart3,
  Key,
  LogOut,
  Menu,
  X,
  Zap,
  Database,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDifyHealth } from '@/app/hooks/useDifyHealth';
import { LanguageSwitcher } from '@/components/dashboard/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  highlight?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export function DashboardNav() {
  const t = useTranslations('dashboard.nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || '';
  const { data: session } = useSession();
  const BACKEND_URL = process.env.NEXT_PUBLIC_DIFY_URL || 'http://localhost:5001';
  const { ok: backendOk, loading: backendChecking } = useDifyHealth(BACKEND_URL);

  const navSections: NavSection[] = [
    {
      title: t('core'),
      items: [
        { name: t('overview'), href: '/dashboard', icon: BarChart3 },
        { name: t('chat'), href: '/dashboard/chat', icon: MessageSquare },
        { name: t('agents'), href: '/dashboard/agents', icon: Brain },
      ],
    },
    {
      title: t('build'),
      items: [
        { name: t('workflows'), href: '/dashboard/workflows', icon: Workflow },
        { name: t('knowledge'), href: '/dashboard/knowledge', icon: Database },
        { name: t('models'), href: '/dashboard/models', icon: Zap },
        { name: t('tools'), href: '/dashboard/tools', icon: Settings },
      ],
    },
    {
      title: t('security'),
      items: [
        { name: t('firewall'), href: '/dashboard/firewall', icon: Shield, highlight: true }, // USP!
      ],
    },
    {
      title: t('admin'),
      items: [{ name: t('settings'), href: '/dashboard/settings', icon: Key }],
    },
  ];

  const NavItems = (
    <div className="space-y-6">
      {navSections.map((section) => (
        <div key={section.title}>
          <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 select-none font-semibold">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const hrefWithLocale = `/${locale}${item.href}`;
              const isActive =
                pathname === hrefWithLocale || pathname?.startsWith(hrefWithLocale + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={hrefWithLocale}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      item.highlight && 'relative',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded bg-primary-foreground md:bg-primary" />
                    )}
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.highlight && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 p-2 rounded-md border bg-background/80 backdrop-blur hover:bg-accent text-foreground"
        aria-label="Menü öffnen"
        aria-controls="dashboard-sidebar"
        aria-expanded={mobileMenuOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className="fixed inset-y-0 left-0 z-40 hidden md:flex w-64 lg:w-72 border-r border-border/50 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl flex-col shadow-2xl"
        aria-label="SIGMACODE AI Dashboard Navigation"
      >
        {/* Premium Header / Brand */}
        <div className="h-16 flex items-center px-4 border-b border-border/50">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
          >
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold tracking-tight">SIGMACODE AI</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <div className="hidden xl:block">
              <ThemeToggle />
            </div>
            <div
              className={cn(
                'hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border',
                backendChecking
                  ? 'text-muted-foreground border-muted-foreground/30'
                  : backendOk
                    ? 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-900/20',
              )}
              aria-live="polite"
              aria-label={backendChecking ? t('checking') : backendOk ? t('online') : t('offline')}
              title={backendChecking ? t('checking') : backendOk ? t('online') : t('offline')}
            >
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  backendChecking ? 'bg-gray-300' : backendOk ? 'bg-emerald-500' : 'bg-amber-500',
                )}
              />
              <span className="sr-only">SIGMACODE AI Backend Status:</span>
              <span>
                {backendChecking ? t('checking') : backendOk ? t('online') : t('offline')}
              </span>
            </div>
          </div>
        </div>

        {/* Premium Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">{NavItems}</div>

        {/* Premium User / Logout */}
        <div className="border-t border-border/50 p-4 space-y-4 bg-gradient-to-t from-background/50 to-transparent">
          {session?.user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? session.user.email ?? 'User'}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border shadow-md"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
                  {(session.user.name || session.user.email || 'U')
                    .split(' ')
                    .map((s) => s[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">
                  {session.user.name || session.user.email}
                </p>
                {session.user.email && (
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/${locale}/dashboard/settings`}
              className="flex-1 text-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t('settings')}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-background border-r p-3 flex flex-col">
            <div className="h-12 flex items-center justify-between">
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-base font-semibold">SIGMACODE AI</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-accent"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex-1 overflow-y-auto">{NavItems}</div>
            <div className="border-t pt-3">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
