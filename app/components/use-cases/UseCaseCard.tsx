'use client';

import Link from 'next/link';
import ThemedCard from '@/components/ui/ThemedCard';
import { UseCaseTheme, getUseCaseTheme } from '@/app/lib/use-case-themes';

interface UseCaseCardProps {
  title: string;
  description: string;
  href: string;
  theme: UseCaseTheme;
  metric?: string;
  className?: string;
}

export function UseCaseCard({
  title,
  description,
  href,
  theme,
  metric,
  className = '',
}: UseCaseCardProps) {
  const themeConfig = getUseCaseTheme(theme);

  // Map UseCaseTheme -> ThemedTone (behalte Farbakzent je Kategorie)
  const tone: 'firewall' | 'agents' | 'robotics' | 'appstore' | 'success' | 'danger' | 'brand' =
    theme === 'security'
      ? 'firewall'
      : theme === 'workflow'
        ? 'agents'
        : theme === 'healthcare' || theme === 'compliance'
          ? 'success'
          : theme === 'infrastructure'
            ? 'danger'
            : 'brand';

  return (
    <Link href={href} className={`group ${className}`}>
      <ThemedCard
        tone={tone}
        title={title}
        description={description}
        kpis={metric ? [metric] : undefined}
        icon={
          <span className="text-2xl" aria-hidden>
            {themeConfig.icon}
          </span>
        }
        showSecurity={false}
        innerClassName="p-6 flex flex-col h-full"
        className="hover:-translate-y-1 transition-transform duration-300"
      />
    </Link>
  );
}
