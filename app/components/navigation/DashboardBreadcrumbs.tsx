'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

// Map segment -> Label
const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  agents: 'Agents',
  firewall: 'Firewall',
  knowledge: 'Knowledge',
  monitoring: 'Monitoring',
  models: 'Models',
  tools: 'Tools',
  settings: 'Einstellungen',
  chat: 'Chat',
  workflows: 'Workflows',
};

function toLabel(seg: string) {
  return LABELS[seg] || decodeURIComponent(seg).slice(0, 32);
}

export default function DashboardBreadcrumbs() {
  const params = useParams();
  const locale = (params?.locale as string) || '';
  const pathname = usePathname() || '/';
  const parts = pathname.split('/').filter(Boolean);
  // Expect shape: [locale, 'dashboard', ...rest]
  const rest = parts.slice(2);

  const items = [
    { href: `/${locale}`, label: 'Start' },
    { href: `/${locale}/dashboard`, label: toLabel('dashboard') },
    ...rest.map((seg, idx) => {
      const href = `/${[locale, 'dashboard', ...rest.slice(0, idx + 1)].join('/')}`;
      return { href, label: toLabel(seg) };
    }),
  ];

  return (
    <nav aria-label="Breadcrumb" className="mt-3">
      <ol className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.href}-${i}`} className="flex items-center">
              {!isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden className="mx-2 select-none">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
