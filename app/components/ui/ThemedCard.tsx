'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import ElegantCard from '@/components/ui/ElegantCard';
import { SecurityIndicator } from '@/components/ui/SecurityIndicator';

export type ThemedTone =
  | 'firewall'
  | 'agents'
  | 'robotics'
  | 'appstore'
  | 'success'
  | 'danger'
  | 'brand';

export interface ThemedCardProps {
  title?: string;
  description?: string;
  badges?: string[];
  kpis?: string[];
  href?: string;
  icon?: ReactNode;
  tone?: ThemedTone;
  className?: string;
  innerClassName?: string;
  ctaLabel?: string;
  showSecurity?: boolean;
  securityStatus?: 'unsecured' | 'processing' | 'protected' | 'warning';
  children?: ReactNode;
  onClick?: () => void;
}

export default function ThemedCard({
  title,
  description,
  badges,
  kpis,
  href,
  icon,
  tone = 'brand',
  className,
  innerClassName,
  ctaLabel = 'Mehr erfahren →',
  showSecurity = true,
  securityStatus,
  children,
  onClick,
}: ThemedCardProps) {
  const locale = useLocale?.() as string | undefined;
  const withLocale = (href?: string) => {
    if (!href) return href;
    // Externe Links und Mail/Tel unverändert lassen
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return href;
    }
    // Wenn kein Locale verfügbar, Rohwert zurückgeben
    if (!locale) return href;
    // Bereits locale-präfixiert
    if (href === `/${locale}` || href.startsWith(`/${locale}/`)) return href;
    // Root
    if (href === '/') return `/${locale}`;
    // Hash-Links: an lokalisierte Root anhängen
    if (href.startsWith('/#')) return `/${locale}${href}`;
    // Normale interne Route
    return `/${locale}${href}`;
  };
  const resolvedStatus =
    securityStatus ??
    (tone === 'firewall' || tone === 'danger'
      ? 'processing'
      : tone === 'success'
        ? 'protected'
        : 'warning');

  return (
    <ElegantCard
      tone={tone}
      pattern="mesh"
      hover
      glow
      innerClassName={`p-6 flex flex-col h-full ${innerClassName ?? ''}`}
      className={className}
      onClick={onClick}
    >
      {/* Header (optional) */}
      {(icon || title) && (
        <div className="flex items-center gap-2">
          {icon && (
            <div className="shrink-0" aria-hidden>
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {description}
        </p>
      )}

      {/* Badges */}
      {badges && badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b}
              className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {/* KPIs */}
      {kpis && kpis.length > 0 && (
        <ul
          className="mt-3 flex flex-wrap gap-3 text-xs"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {kpis.map((k) => (
            <li
              key={k}
              className="rounded-full border px-2 py-1"
              style={{ borderColor: 'var(--border)' }}
            >
              {k}
            </li>
          ))}
        </ul>
      )}

      {/* Custom content slot */}
      {children && <div className="mt-3">{children}</div>}

      {/* Footer */}
      {(showSecurity || href) && (
        <div className="mt-4 flex items-center justify-between gap-3">
          {showSecurity && <SecurityIndicator status={resolvedStatus} size="sm" animated />}
          {href && (
            <Link
              href={withLocale(href) ?? href}
              className="text-sm font-medium hover:underline text-brand-electric"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      )}
    </ElegantCard>
  );
}
