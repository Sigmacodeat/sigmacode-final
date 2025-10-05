'use client';

import {
  Bot,
  Shield,
  FileText,
  Headset,
  Database,
  Bug,
  LayoutDashboard,
  BarChart3,
  MessagesSquare,
  Sparkles,
  Activity,
  Lock,
  BookOpen,
  History,
  Plug,
  BadgePercent,
  Mail,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ActiveLink } from '@/components/navigation/ActiveLink';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useLocale } from 'next-intl';
import { NotificationBell } from '@/components/notifications/NotificationSystem';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Header() {
  const locale = useLocale();
  const tNav = useTranslations('navigation');
  const prefix = `/${locale}`;
  const withLocale = (href: string) => {
    // Externe Links oder Mail/Tel unverändert
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))
      return href;
    // Bereits locale-präfixiert
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    // Root
    // Root: immer auf die lokalisierte Root verweisen
    if (href === '/') return prefix;
    // Hash-Links: auf lokalisierte Landing verweisen (e.g., '/de/#section')
    if (href.startsWith('/#')) return `${prefix}${href}`;
    // Normale interne Route
    return `${prefix}${href}`;
  };
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState<string>('');
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [hasShadow, setHasShadow] = useState(false);
  const [visibleHash, setVisibleHash] = useState<string>('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const navRef = useRef<HTMLElement | null>(null);
  const hoverTimers = useRef<Record<string, number | undefined>>({});
  // Konfigurierbare Hover-Delays (ms)
  const HOVER_OPEN_DELAY = prefersReducedMotion ? 0 : 60;
  const HOVER_CLOSE_DELAY = prefersReducedMotion ? 0 : 150;

  // Gruppiertes Navigationsmodell
  type NavIcon =
    | 'Shield'
    | 'FileText'
    | 'Headset'
    | 'Database'
    | 'Bug'
    | 'LayoutDashboard'
    | 'BarChart3'
    | 'MessagesSquare'
    | 'Sparkles'
    | 'Activity'
    | 'Lock'
    | 'BookOpen'
    | 'History'
    | 'Plug'
    | 'BadgePercent'
    | 'Mail'
    | 'Bot';
  type NavItem = {
    href: string;
    label: string;
    icon?: NavIcon;
    badge?: string;
    description?: string;
    separator?: boolean;
  };
  type NavGroup = { id: string; label: string; items: NavItem[] };

  const IconComponents = {
    Shield,
    FileText,
    Headset,
    Database,
    Bug,
    LayoutDashboard,
    BarChart3,
    MessagesSquare,
    Sparkles,
    Activity,
    Lock,
    BookOpen,
    History,
    Plug,
    BadgePercent,
    Mail,
    Bot,
  } as const;

  const groups = useMemo<NavGroup[]>(
    () => [
      {
        id: 'produkte',
        label: tNav('products'),
        items: [
          {
            href: withLocale('/dashboard'),
            label: tNav('productsOverview'),
            icon: 'LayoutDashboard',
            description: 'Alle Produkte im Überblick',
          },
          {
            href: withLocale('/firewall'),
            label: tNav('firewall'),
            icon: 'Shield',
            description: 'Neurale Firewall & Policies',
          },
          {
            href: withLocale('/agents'),
            label: tNav('agents'),
            icon: 'Bot',
            description: 'MAS‑Agenten & Orchestrierung',
          },
          { href: '#', label: '—', separator: true },
          {
            href: withLocale('/robotics'),
            label: tNav('robotics'),
            icon: 'Activity',
            badge: 'Coming Soon',
            description: 'Demnächst verfügbar',
          },
          {
            href: withLocale('/appstore'),
            label: tNav('appstore'),
            icon: 'Plug',
            badge: 'Coming Soon',
            description: 'Demnächst verfügbar',
          },
        ],
      },
      {
        id: 'usecases',
        label: tNav('useCases'),
        items: [
          // Kuratierte Use Cases (kompakt, edel)
          {
            href: withLocale('/use-cases/pii-redaction-firewall'),
            label: 'PII‑Redaction Firewall',
            icon: 'Shield',
            badge: 'Popular',
            description: 'Automatische PII‑Erkennung & Redaction',
          },
          {
            href: withLocale('/use-cases/soc2-evidence-collector'),
            label: 'SOC2 Evidence Collector',
            icon: 'BookOpen',
            description: 'Compliance‑Automatisierung & Audit‑Trails',
          },
          {
            href: withLocale('/use-cases/workflow-automation'),
            label: 'Workflow‑Automation',
            icon: 'LayoutDashboard',
            description: 'Versionierte Pipelines & Scheduling',
          },
          {
            href: withLocale('/use-cases/data-extraction-rag'),
            label: 'Data Extraction & RAG',
            icon: 'Database',
            description: 'Dokumenten‑Verarbeitung & Retrieval',
          },
          {
            href: withLocale('/use-cases/critical-infrastructure'),
            label: 'Critical Infrastructure',
            icon: 'Activity',
            description: 'OT/IT‑Sicherheit – Shadow → Enforce',
          },
          {
            href: withLocale('/use-cases/healthcare-medical'),
            label: 'Healthcare AI',
            icon: 'Activity',
            description: 'HIPAA‑konform, PII‑Schutz, Audit',
          },
          {
            href: withLocale('/use-cases/financial-trading'),
            label: 'Financial Trading',
            icon: 'BarChart3',
            description: 'MiFID II‑konforme Automatisierung',
          },
          {
            href: withLocale('/use-cases/government-public'),
            label: 'Government AI',
            icon: 'Lock',
            description: 'DSGVO, RBAC, Nachvollziehbarkeit',
          },
          {
            href: withLocale('/use-cases/research-compliance'),
            label: 'Research Compliance',
            icon: 'BookOpen',
            description: 'Verifizierte Quellen & Policy‑Checks',
          },
          {
            href: withLocale('/use-cases/customer-support'),
            label: 'Customer Support Copilot',
            icon: 'Headset',
            description: 'Qualität rauf, Handle‑Time runter',
          },
          {
            href: withLocale('/use-cases/incident-response'),
            label: 'Incident Response',
            icon: 'Bug',
            description: 'Security‑Playbooks & Response',
          },
          { href: '#', label: '—', separator: true },
          {
            href: withLocale('/mas'),
            label: 'Multi‑Agent Systems',
            icon: 'Bot',
            badge: 'Popular',
            description: 'Orchestrierte Agenten & Tools',
          },
          { href: '#', label: '—', separator: true },
          {
            href: withLocale('/use-cases'),
            label: 'Alle Use Cases',
            icon: 'FileText',
            description: 'Komplette Übersicht aller Anwendungsfälle',
          },
        ],
      },
      {
        id: 'security',
        label: tNav('security'),
        items: [
          {
            href: withLocale('/firewall'),
            label: tNav('firewall'),
            icon: 'Shield',
            description: 'Dokumentation & Features',
          },
          {
            href: withLocale('/dashboard/firewall/monitor'),
            label: 'Neural Firewall Monitor',
            icon: 'Activity',
            description: 'Live‑Telemetrie & Metriken',
          },
          {
            href: withLocale('/security'),
            label: 'Security Overview',
            icon: 'Lock',
            description: 'Kontrollen & Compliance',
          },
        ],
      },
      {
        id: 'ressourcen',
        label: tNav('resources'),
        items: [
          { href: withLocale('/docs'), label: tNav('docs'), icon: 'BookOpen' },
          { href: withLocale('/changelog'), label: tNav('changelog'), icon: 'History' },
          { href: withLocale('/#integrations'), label: tNav('integrations'), icon: 'Plug' },
        ],
      },
      {
        id: 'company',
        label: tNav('company'),
        items: [
          { href: withLocale('/pricing'), label: tNav('pricing'), icon: 'BadgePercent' },
          { href: withLocale('/contact'), label: tNav('contact'), icon: 'Mail' },
        ],
      },
    ],
    [tNav],
  );

  // Kuratierte Use‑Case Gruppen für Mega‑Menü (2 Spalten x 2 Reihen)
  const useCaseGroups = useMemo(
    () => [
      {
        id: 'security',
        title: 'Security',
        items: [
          {
            href: withLocale('/use-cases/pii-redaction-firewall'),
            label: 'PII‑Redaction Firewall',
            icon: 'Shield',
            badge: 'Popular',
            description: 'Automatische PII‑Erkennung & Redaction',
          },
          {
            href: withLocale('/use-cases/incident-response'),
            label: 'Incident Response',
            icon: 'Bug',
            description: 'Security‑Playbooks & Response',
          },
        ] as NavItem[],
      },
      {
        id: 'compliance',
        title: 'Compliance',
        items: [
          {
            href: withLocale('/use-cases/soc2-evidence-collector'),
            label: 'SOC2 Evidence Collector',
            icon: 'BookOpen',
            description: 'Compliance‑Automatisierung & Audit‑Trails',
          },
          {
            href: withLocale('/use-cases/research-compliance'),
            label: 'Research Compliance',
            icon: 'BookOpen',
            description: 'Verifizierte Quellen & Policy‑Checks',
          },
        ] as NavItem[],
      },
      {
        id: 'workflows',
        title: 'Workflows',
        items: [
          {
            href: withLocale('/use-cases/workflow-automation'),
            label: 'Workflow‑Automation',
            icon: 'LayoutDashboard',
            description: 'Versionierte Pipelines & Scheduling',
          },
          {
            href: withLocale('/use-cases/data-extraction-rag'),
            label: 'Data Extraction & RAG',
            icon: 'Database',
            description: 'Dokumenten‑Verarbeitung & Retrieval',
          },
        ] as NavItem[],
      },
      {
        id: 'industries',
        title: 'Industries',
        items: [
          {
            href: withLocale('/use-cases/critical-infrastructure'),
            label: 'Critical Infrastructure',
            icon: 'Activity',
            description: 'OT/IT‑Sicherheit – Shadow → Enforce',
          },
          {
            href: withLocale('/use-cases/healthcare-medical'),
            label: 'Healthcare AI',
            icon: 'Activity',
            description: 'HIPAA‑konform, PII‑Schutz, Audit',
          },
          {
            href: withLocale('/use-cases/financial-trading'),
            label: 'Financial Trading',
            icon: 'BarChart3',
            description: 'MiFID II‑konforme Automatisierung',
          },
          {
            href: withLocale('/use-cases/government-public'),
            label: 'Government AI',
            icon: 'Lock',
            description: 'DSGVO, RBAC, Nachvollziehbarkeit',
          },
        ] as NavItem[],
      },
    ],
    [withLocale],
  );

  const getBadgeClass = (badge?: string) => {
    if (!badge) return '';
    const b = badge.toLowerCase();
    if (b === 'popular') {
      return 'ml-2 inline-flex items-center rounded-full bg-[color:var(--brand-600)]/18 px-2 py-0.5 text-[10px] font-medium text-[color:var(--brand-foreground)]';
    }
    if (b === 'coming soon') {
      return 'ml-2 inline-flex items-center rounded-full bg-[color:var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--muted-foreground)] ring-1 ring-inset ring-[color:var(--border)]';
    }
    return 'ml-2 inline-flex items-center rounded-full bg-[color:var(--brand)]/12 px-2 py-0.5 text-[10px] font-medium text-[color:var(--brand-foreground)]';
  };

  // Track hash changes for in-page anchors
  useEffect(() => {
    const update = () => setHash(window.location.hash || '');
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  // Load announcement dismissal state
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('announce.dismissed.v2');
      if (dismissed === '1') setShowAnnouncement(false);
    } catch {}
  }, []);

  const dismissAnnouncement = useCallback(() => {
    setShowAnnouncement(false);
    try {
      localStorage.setItem('announce.dismissed.v2', '1');
    } catch {}
  }, []);

  // Header shadow on scroll
  useEffect(() => {
    const onScroll = () => {
      setHasShadow(window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-Spy für Anker-Sections
  useEffect(() => {
    const ids = [
      'features',
      'integrations',
      'workflow',
      'use-cases',
      'security',
      'pricing',
      'testimonials',
      'contact',
    ];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Wähle die am stärksten sichtbare Section
        let top: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!top || e.intersectionRatio > top.intersectionRatio) {
              top = e;
            }
          }
        }
        if (top) {
          const id = (top.target as HTMLElement).id;
          setVisibleHash(`#${id}`);
        }
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Keyboard handling for desktop dropdowns (Enter/Space toggle, ArrowDown focuses first item)
  const onGroupKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, groupId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpenGroup((cur) => (cur === groupId ? null : groupId));
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const firstItem = document.querySelector<HTMLAnchorElement>(`#menu-${groupId} a`);
        firstItem?.focus();
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        // Zwischen den Gruppen-Triggern horizontal navigieren
        const container = navRef.current;
        const triggers = container
          ? Array.from(
              container.querySelectorAll<HTMLButtonElement>("button[aria-haspopup='menu']"),
            )
          : [];
        const idx = triggers.findIndex((btn) => btn === e.currentTarget);
        if (idx >= 0 && triggers.length > 0) {
          const delta = e.key === 'ArrowRight' ? 1 : -1;
          const next = triggers[(idx + delta + triggers.length) % triggers.length];
          next?.focus();
          // optional: geöffnetes Menü anpassen
          const nextGroupId = next?.getAttribute('aria-controls')?.replace('menu-', '') || null;
          if (nextGroupId) setOpenGroup(nextGroupId);
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpenGroup(null);
      }
    },
    [],
  );

  // Desktop Hover-Intent: kleine Verzögerung beim Öffnen/Schließen, um Flackern zu vermeiden
  const handleGroupMouseEnter = useCallback(
    (groupId: string) => {
      // schließe evtl. geplantes Schließen
      if (hoverTimers.current[groupId]) {
        window.clearTimeout(hoverTimers.current[groupId]);
      }
      hoverTimers.current[groupId] = window.setTimeout(() => {
        setOpenGroup(groupId);
      }, HOVER_OPEN_DELAY);
    },
    [HOVER_OPEN_DELAY],
  );

  const handleGroupMouseLeave = useCallback(
    (groupId: string) => {
      if (hoverTimers.current[groupId]) {
        window.clearTimeout(hoverTimers.current[groupId]);
      }
      hoverTimers.current[groupId] = window.setTimeout(() => {
        setOpenGroup((cur) => (cur === groupId ? null : cur));
      }, HOVER_CLOSE_DELAY);
    },
    [HOVER_CLOSE_DELAY],
  );

  // Timer-Cleanup bei Unmount
  useEffect(() => {
    return () => {
      Object.values(hoverTimers.current).forEach((t) => t && window.clearTimeout(t));
    };
  }, []);

  const isActive = (href: string) => {
    // Hash-Links: '#section' oder '/#section'
    if (href.includes('#')) {
      const targetHash = href.slice(href.indexOf('#'));
      const current = visibleHash || hash;
      // aktiv, wenn Startseite und sichtbarer Hash passt
      if (
        (pathname === '/' ||
          pathname === '' ||
          pathname === `/${locale}` ||
          pathname === `/${locale}/`) &&
        current &&
        targetHash === current
      ) {
        return true;
      }
      return false;
    }
    // Normale Pfade: aktiv, wenn Pfad exakt oder Präfix (Unterpfad) ist
    return pathname === href || (href !== '/' && pathname?.startsWith(href));
  };

  const isGroupActive = (groupId: string) => {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return false;
    return g.items.some((it) => isActive(it.href));
  };

  const isHome =
    pathname === '/' || pathname === '' || pathname === `/${locale}` || pathname === `/${locale}/`;

  // Click-Outside: schließt geöffnete Desktop-Dropdowns bei Klick außerhalb der Nav
  useEffect(() => {
    if (!openGroup) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (navRef.current && target && !navRef.current.contains(target)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openGroup]);

  // Auf Routenwechsel Mobile-Menü und Dropdowns schließen
  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
    setOpenMobileGroup(null);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        hasShadow ? 'shadow-md backdrop-blur-lg backdrop-saturate-150' : 'shadow-none',
      )}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: hasShadow ? 'var(--header-bg)' : 'transparent',
        backdropFilter: hasShadow ? 'blur(10px) saturate(150%)' : undefined,
      }}
    >
      {/* Announcement Bar (dismissible) */}
      {showAnnouncement && (
        <div className="border-b/0" style={{ background: 'transparent' }}>
          <div className="mx-auto max-w-7xl px-4 py-1.5">
            <div
              className="relative flex items-center justify-center gap-2 rounded-full border px-3 py-1 text-xs shadow-sm backdrop-blur bg-clip-padding"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'color-mix(in oklab, var(--card) 85%, transparent)',
                color: 'var(--muted-foreground)',
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                NEU
              </span>
              <span className="hidden sm:inline">
                Firewall‑Powered MAS jetzt in <strong>Shadow</strong> & <strong>Enforce</strong>{' '}
                verfügbar
              </span>
              <span className="sm:hidden">Firewall‑Powered MAS: Shadow & Enforce</span>
              <Link
                href={withLocale('/mas')}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] focus:outline-none focus-visible:ring-2"
                style={
                  {
                    color: 'var(--primary)',
                    '--tw-ring-color': 'var(--ring)',
                  } as React.CSSProperties & Record<string, string>
                }
              >
                Mehr erfahren
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </Link>
              <button
                type="button"
                aria-label="Ankündigung schließen"
                onClick={dismissAnnouncement}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 focus:outline-none focus-visible:ring-2"
                style={{ '--tw-ring-color': 'var(--ring)' } as React.CSSProperties}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-2">
        <div
          className="flex h-12 items-center justify-between rounded-2xl px-3 bg-clip-padding"
          style={{
            backgroundColor:
              hasShadow && !isHome
                ? 'color-mix(in oklab, var(--card) 90%, transparent)'
                : isHome
                  ? 'transparent'
                  : 'var(--header-bg)',
            backdropFilter: hasShadow && !isHome ? 'saturate(140%) blur(6px)' : undefined,
          }}
        >
          <Link
            href={withLocale('/')}
            className="flex items-center gap-2 font-semibold tracking-tight focus:outline-none focus-visible:ring-2 rounded"
            style={{ outlineColor: 'transparent' }}
          >
            {/* Logo-Icon: Lucide Bot */}
            <Bot
              aria-hidden
              className="h-6 w-6 shrink-0 text-brand-electric md:h-7 md:w-7 transition-colors"
            />
            {/* Neural Quantum AI Branding */}
            <span className="leading-none">
              <span className="block text-lg md:text-xl font-extrabold bg-gradient-brand bg-clip-text text-transparent">
                SIGMACODE AI
              </span>
              <span className="block text-[10px] tracking-wider font-medium text-brand-electric/80">
                Neural Firewall
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-5 md:flex"
            role="menubar"
            aria-label="Hauptnavigation"
            ref={navRef}
          >
            {groups.map((g) => (
              <div
                key={g.id}
                className="relative"
                onMouseEnter={() => handleGroupMouseEnter(g.id)}
                onMouseLeave={() => handleGroupMouseLeave(g.id)}
              >
                <button
                  type="button"
                  className="group rounded-md px-2.5 py-1.5 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 hover:text-[color:var(--fg)] hover:bg-[color:var(--muted)]/70"
                  style={
                    {
                      color: isGroupActive(g.id) ? 'var(--fg)' : 'var(--muted-foreground)',
                      backgroundColor:
                        openGroup === g.id || isGroupActive(g.id) ? 'var(--muted)' : 'transparent',
                      '--tw-ring-color': 'var(--ring)',
                    } as React.CSSProperties
                  }
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={openGroup === g.id}
                  aria-controls={`menu-${g.id}`}
                  onFocus={() => setOpenGroup(g.id)}
                  onBlur={(e) => {
                    // Schließe, wenn Fokus komplett raus geht
                    if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                      setOpenGroup((cur) => (cur === g.id ? null : cur));
                    }
                  }}
                  onKeyDown={(e) => onGroupKeyDown(e, g.id)}
                >
                  <span className="relative inline-flex items-center gap-1">
                    {g.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-transform duration-200 ease-out"
                      style={{
                        transform: openGroup === g.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {/* Animierte Unterstreichung */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full transition-all duration-200 ease-out group-hover:w-6"
                      style={{
                        backgroundColor: 'var(--brand-600)',
                        width: openGroup === g.id || isGroupActive(g.id) ? 24 : 0,
                      }}
                    />
                  </span>
                </button>
                <AnimatePresence>
                  {openGroup === g.id && (
                    <motion.div
                      id={`menu-${g.id}`}
                      role="menu"
                      className="absolute left-0 mt-2 rounded-xl border p-2 shadow-2xl will-change-transform backdrop-blur-md ring-1 ring-black/5 dark:ring-white/5 bg-clip-padding"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                      }}
                      onKeyDown={(e) => {
                        const items = Array.from(
                          (e.currentTarget.querySelectorAll(
                            'a',
                          ) as NodeListOf<HTMLAnchorElement>) || [],
                        );
                        const activeEl = document.activeElement as HTMLElement | null;
                        const idx = activeEl ? items.findIndex((n) => n === activeEl) : -1;
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const next = items[(idx + 1 + items.length) % items.length];
                          next?.focus();
                        }
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          const prev = items[(idx - 1 + items.length) % items.length];
                          prev?.focus();
                        }
                        // Fokus-Trap mit Tab/Shift+Tab innerhalb des Dropdowns
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const direction = e.shiftKey ? -1 : 1;
                          const nextIndex =
                            idx === -1
                              ? direction > 0
                                ? 0
                                : items.length - 1
                              : (idx + direction + items.length) % items.length;
                          items[nextIndex]?.focus();
                        }
                        if (e.key === 'Home') {
                          e.preventDefault();
                          items[0]?.focus();
                        }
                        if (e.key === 'End') {
                          e.preventDefault();
                          items[items.length - 1]?.focus();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          setOpenGroup(null);
                          // Fokus zurück auf den auslösenden Button
                          const trigger = document.querySelector<HTMLButtonElement>(
                            `button[aria-controls='menu-${g.id}']`,
                          );
                          trigger?.focus();
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setOpenGroup(null);
                        }
                      }}
                      initial={
                        prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }
                      }
                      animate={
                        prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 4, scale: 1 }
                      }
                      exit={
                        prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }
                      }
                      transition={{
                        duration: prefersReducedMotion ? 0.08 : 0.18,
                        ease: 'easeOut',
                      }}
                    >
                      {g.id !== 'usecases' ? (
                        // Standard-Rendering für alle Gruppen außer Use Cases
                        <div className="min-w-[260px]">
                          {g.items.map((it) => {
                            if (it.separator)
                              return (
                                <div
                                  key={`sep-${g.id}-${Math.random().toString(36).slice(2)}`}
                                  role="separator"
                                  className="my-2 h-px w-full bg-[color:var(--border)]"
                                />
                              );
                            const active = isActive(it.href);
                            return (
                              <ActiveLink
                                key={it.href}
                                href={it.href}
                                title={it.label}
                                aria-current={active ? 'page' : undefined}
                                role="menuitem"
                                className="group flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-all duration-200 ease-out hover:translate-x-0.5 hover:bg-[color:var(--brand)]/10 hover:text-[color:var(--brand-600)] focus-visible:outline-none focus-visible:ring-2"
                                activeClassName="bg-[color:var(--muted)] text-[color:var(--fg)]"
                                inactiveClassName="text-[color:var(--muted-foreground)]"
                                detectHash
                                trackEventName="nav_click"
                                trackProps={{
                                  placement: 'desktop',
                                  group: g.id,
                                  label: it.label,
                                  href: it.href,
                                }}
                                style={{
                                  color: active ? 'var(--fg)' : 'var(--muted-foreground)',
                                  backgroundColor: active ? 'var(--muted)' : 'transparent',
                                }}
                                onMouseDown={() => setOpenGroup(null)}
                              >
                                <div className="flex min-w-0 items-start gap-2">
                                  {it.icon &&
                                    (() => {
                                      const Icon = (IconComponents as any)[it.icon];
                                      return Icon ? (
                                        <Icon
                                          aria-hidden
                                          className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)] transition-colors duration-200 ease-out group-hover:text-[color:var(--brand-600)]"
                                        />
                                      ) : null;
                                    })()}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate">{it.label}</span>
                                      {it.badge && (
                                        <span className={getBadgeClass(it.badge)}>{it.badge}</span>
                                      )}
                                    </div>
                                    {it.description && (
                                      <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--muted-foreground)]/80">
                                        {it.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </ActiveLink>
                            );
                          })}
                        </div>
                      ) : (
                        // Kompaktes, gruppiertes Menü (zweispaltig, barrierefreundlich)
                        <div className="min-w-[640px] max-w-[760px] p-2.5">
                          <div className="flex flex-col gap-2.5">
                            {useCaseGroups.map((grp) => (
                              <section
                                key={grp.id}
                                role="group"
                                aria-labelledby={`usecases-${grp.id}-label`}
                                className="rounded-md p-2"
                              >
                                <h3
                                  id={`usecases-${grp.id}-label`}
                                  className="mb-1 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]"
                                >
                                  {grp.title}
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                  {grp.items.map((it) => {
                                    const active = isActive(it.href);
                                    return (
                                      <li
                                        key={`${grp.id}-${it.href}`}
                                        className="border-t first:border-t-0"
                                        style={{ borderColor: 'var(--border)' }}
                                      >
                                        <ActiveLink
                                          href={it.href}
                                          title={it.label}
                                          aria-current={active ? 'page' : undefined}
                                          role="menuitem"
                                          className="group flex items-center gap-3 rounded-md px-2 py-1.5 text-[13px] transition-all duration-200 ease-out hover:bg-[color:var(--brand)]/10 hover:text-[color:var(--brand-600)] focus-visible:outline-none focus-visible:ring-2"
                                          activeClassName="bg-[color:var(--muted)] text-[color:var(--fg)]"
                                          inactiveClassName="text-[color:var(--muted-foreground)]"
                                          trackEventName="nav_click"
                                          trackProps={{
                                            placement: 'desktop',
                                            group: `usecases:${grp.id}`,
                                            label: it.label,
                                            href: it.href,
                                          }}
                                          style={{
                                            color: active ? 'var(--fg)' : 'var(--muted-foreground)',
                                            backgroundColor: active
                                              ? 'var(--muted)'
                                              : 'transparent',
                                          }}
                                          onMouseDown={() => setOpenGroup(null)}
                                        >
                                          <div className="flex min-w-0 items-start gap-2">
                                            {it.icon &&
                                              (() => {
                                                const Icon = (IconComponents as any)[it.icon];
                                                return Icon ? (
                                                  <Icon
                                                    aria-hidden
                                                    className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)] transition-colors duration-200 ease-out group-hover:text-[color:var(--brand-600)]"
                                                  />
                                                ) : null;
                                              })()}
                                            <div className="min-w-0">
                                              <div className="flex items-center gap-2">
                                                <span className="truncate">{it.label}</span>
                                              </div>
                                              {it.description && (
                                                <p className="mt-0.5 line-clamp-1 text-[11px] text-[color:var(--muted-foreground)]/80">
                                                  {it.description}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </ActiveLink>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </section>
                            ))}
                          </div>
                          <div className="mt-2.5 flex items-center justify-end px-1">
                            <ActiveLink
                              href={withLocale('/use-cases')}
                              title="Alle Use Cases"
                              className="text-xs rounded px-2 py-1 hover:bg-[color:var(--muted)]"
                              inactiveClassName="text-[color:var(--muted-foreground)]"
                              activeClassName="text-[color:var(--fg)]"
                              onMouseDown={() => setOpenGroup(null)}
                            >
                              Alle Use Cases
                            </ActiveLink>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <div className="hidden items-center overflow-hidden rounded-full text-sm md:flex">
              <ActiveLink
                href={withLocale('/login')}
                className="px-3.5 py-1.5 transition-colors hover:bg-[color:var(--muted)]"
                style={{ color: 'var(--fg)' } as React.CSSProperties & Record<string, string>}
                aria-label="Login"
                trackEventName="nav_click"
              >
                Login
              </ActiveLink>
              <ActiveLink
                href={withLocale('/register')}
                className="px-3.5 py-1.5 transition-colors hover:bg-[color:var(--muted)]"
                style={{ color: 'var(--fg)' } as React.CSSProperties}
                aria-label="Registrieren"
              >
                Sign up
              </ActiveLink>
            </div>
            <ThemeToggle />
            <NotificationBell />
          </nav>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded md:hidden focus:outline-none focus-visible:ring-2"
            aria-label="Menü öffnen"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            style={
              {
                '--tw-ring-color': 'var(--ring)',
              } as React.CSSProperties
            }
          >
            <span className="sr-only">Menü</span>
            <svg
              className="h-5 w-5 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--fg)' }}
            >
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      <div
        id="mobile-menu"
        className={
          'md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ' +
          (open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')
        }
        style={{
          backgroundColor: isHome ? 'transparent' : 'var(--header-bg)',
        }}
        role="navigation"
        aria-label="Mobile Navigation"
      >
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <div key={g.id} className="rounded-md" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded px-2 py-2 text-sm focus:outline-none focus-visible:ring-2"
                  style={{ '--tw-ring-color': 'var(--ring)' } as React.CSSProperties}
                  onClick={() => setOpenMobileGroup((cur) => (cur === g.id ? null : g.id))}
                  aria-expanded={openMobileGroup === g.id}
                  aria-controls={`mobile-menu-${g.id}`}
                >
                  <span style={{ color: 'var(--fg)' }}>{g.label}</span>
                  <span aria-hidden="true" style={{ color: 'var(--muted-foreground)' }}>
                    {openMobileGroup === g.id ? '−' : '+'}
                  </span>
                </button>
                {openMobileGroup === g.id && (
                  <div id={`mobile-menu-${g.id}`} className="pl-2" role="menu">
                    {g.items.map((it) => {
                      if (it.separator) {
                        return (
                          <div
                            key={`m-sep-${g.id}-${Math.random().toString(36).slice(2)}`}
                            role="separator"
                            className="my-2 ml-1 h-px w-[calc(100%-0.25rem)] bg-[color:var(--border)]"
                          />
                        );
                      }
                      const active = isActive(it.href);
                      return (
                        <ActiveLink
                          key={it.href}
                          href={it.href}
                          title={it.label}
                          aria-current={active ? 'page' : undefined}
                          role="menuitem"
                          className="flex items-start justify-between gap-3 rounded px-2 py-2 text-sm"
                          activeClassName="bg-[color:var(--muted)] text-[color:var(--fg)]"
                          inactiveClassName="text-[color:var(--muted-foreground)]"
                          detectHash
                          trackEventName="nav_click"
                          trackProps={{
                            placement: 'mobile',
                            group: g.id,
                            label: it.label,
                            href: it.href,
                          }}
                          style={{
                            color: active ? 'var(--fg)' : 'var(--muted-foreground)',
                            backgroundColor: active ? 'var(--muted)' : 'transparent',
                          }}
                          onClick={() => setOpen(false)}
                        >
                          <span className="inline-flex min-w-0 items-start gap-2">
                            {it.icon &&
                              (() => {
                                const Icon = (IconComponents as any)[it.icon];
                                return Icon ? (
                                  <Icon
                                    aria-hidden
                                    className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)]"
                                  />
                                ) : null;
                              })()}
                            <span className="min-w-0">
                              <span className="block truncate">{it.label}</span>
                              {it.description && (
                                <span className="mt-0.5 block text-xs text-[color:var(--muted-foreground)]/80 line-clamp-1">
                                  {it.description}
                                </span>
                              )}
                            </span>
                          </span>
                          {it.badge && <span className={getBadgeClass(it.badge)}>{it.badge}</span>}
                        </ActiveLink>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            <ActiveLink
              href={withLocale('/login')}
              className="rounded-full px-3.5 py-2 text-center text-sm shadow-sm transition-opacity focus:outline-none focus-visible:ring-2 hover:bg-[color:var(--muted)]"
              style={
                {
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                } as React.CSSProperties
              }
              onClick={() => setOpen(false)}
              aria-label="Login"
              trackEventName="nav_click"
              trackProps={{
                placement: 'mobile',
                group: 'auth',
                label: 'Login',
                href: '/login',
              }}
            >
              Login
            </ActiveLink>
            <ActiveLink
              href={withLocale('/register')}
              className="rounded-lg px-3 py-2 text-center text-sm shadow-sm transition-opacity focus:outline-none focus-visible:ring-2 hover:bg-[color:var(--muted)]"
              style={
                {
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-fg)',
                } as React.CSSProperties
              }
            >
              Sign up
            </ActiveLink>
            <LanguageToggle />
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
}
