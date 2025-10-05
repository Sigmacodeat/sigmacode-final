'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState, forwardRef } from 'react';
import { trackEvent, type AnalyticsProps } from '../../lib/analytics';

export type ActiveLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  LinkProps & {
    activeClassName?: string;
    inactiveClassName?: string;
    exact?: boolean;
    detectHash?: boolean;
    detectSearch?: boolean;
    /**
     * Falls true, wird segment-sicher gematcht ("/blog" matcht "/blog" oder "/blog/...",
     * aber nicht "/blogger"). Bei false wird simples startsWith verwendet.
     */
    activeBySegment?: boolean;
    trackEventName?: string;
    trackProps?: AnalyticsProps | (() => AnalyticsProps);
  };

/**
 * ActiveLink
 * - erkennt aktiven Zustand anhand von pathname oder Hash
 * - respektiert Next.js prefetching (standardmäßig an)
 * - setzt aria-current="page" für aktive Ziele
 */
export const ActiveLink = forwardRef<HTMLAnchorElement, ActiveLinkProps>(function ActiveLink(
  {
    href,
    children,
    className,
    activeClassName,
    inactiveClassName,
    exact = false,
    detectHash = true,
    detectSearch = false,
    prefetch = true,
    activeBySegment = true,
    trackEventName,
    trackProps,
    ...rest
  },
  ref,
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState<string>('');

  useEffect(() => {
    if (!detectHash) return;
    const update = () => setHash(window.location.hash || '');
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [detectHash]);

  const hrefStr = useMemo(() => {
    if (typeof href === 'string') return href;
    const hrefPath = href.pathname ?? '/';
    let hrefSearch = '';
    if (detectSearch) {
      if ((href as any).search) {
        hrefSearch = (href as any).search as string;
      } else if (href.query && Object.keys(href.query).length) {
        hrefSearch = `?${new URLSearchParams(href.query as Record<string, string>).toString()}`;
      }
    }
    const hrefHash = detectHash ? (href.hash ?? '') : '';
    return `${hrefPath}${hrefSearch}${hrefHash}`;
  }, [href, detectSearch, detectHash]);

  // Externe Links nicht als aktiv markieren und nicht prefetchen
  const isExternal = useMemo(() => {
    return (
      /^(https?:)?\/\//i.test(hrefStr) ||
      hrefStr.startsWith('mailto:') ||
      hrefStr.startsWith('tel:')
    );
  }, [hrefStr]);

  // Pfade normalisieren: Query und Hash entfernen für Path-Vergleiche, Trailing Slash vereinheitlichen
  const normalizePath = (p?: string | null) => {
    if (!p) return '';
    try {
      // Wenn absolute URL, über URL-API normalisieren
      if (/^(https?:)?\/\//i.test(p)) {
        const u = new URL(
          p,
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
        );
        p = u.pathname;
      }
    } catch {
      // ignore
    }
    // Query und Hash entfernen, Trailing Slash trimmen (außer root)
    p = p.split('?')[0]?.split('#')[0] ?? '';
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  };

  const safeStartsWithSegment = (base: string, target: string) => {
    if (!activeBySegment) return base.startsWith(target);
    if (!base.startsWith(target)) return false;
    const nextChar = base.charAt(target.length);
    return nextChar === '' || nextChar === '/'; // segment-sicher
  };

  const { isActive, ariaCurrent } = useMemo(() => {
    if (isExternal) return { isActive: false, ariaCurrent: undefined } as const;

    // Build current location (path + optional ?query)
    const currentSearch =
      detectSearch && searchParams
        ? (() => {
            const s = searchParams.toString();
            return s ? `?${s}` : '';
          })()
        : '';
    const current = `${pathname ?? ''}${currentSearch}`;

    // Normalize href to a string path + optional ?query + optional #hash
    const active = exact ? current === hrefStr : current === hrefStr || current.startsWith(hrefStr);
    return {
      isActive: active,
      ariaCurrent: active ? ('page' as const) : undefined,
    };
  }, [pathname, hash, hrefStr, exact, detectHash, detectSearch, searchParams]);

  const composedClassName = useMemo(() => {
    return [className, isActive ? activeClassName : inactiveClassName].filter(Boolean).join(' ');
  }, [className, activeClassName, inactiveClassName, isActive]);

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (typeof rest.onClick === 'function') {
      rest.onClick(e);
    }
    if (trackEventName) {
      try {
        const props = typeof trackProps === 'function' ? trackProps() : trackProps;
        trackEvent(trackEventName, props);
      } catch (_) {
        // no-op
      }
    }
  };

  return (
    <Link
      ref={ref}
      href={href}
      className={composedClassName}
      aria-current={ariaCurrent}
      prefetch={isExternal ? false : prefetch}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </Link>
  );
});
