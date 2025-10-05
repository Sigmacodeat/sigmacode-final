'use client';
/**
 * SIGMACODE AI - Quick Actions
 *
 * Schnellzugriff-Buttons für häufige Aktionen im Dashboard
 */
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Plus, Brain, Shield, MessageSquare, Settings } from 'lucide-react';

export function QuickActions() {
  const t = useTranslations('dashboard.quickActions');
  const params = useParams();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const locale = (params?.locale as string) || '';
  const actions = [
    {
      key: 'newAgent',
      name: t('newAgent'),
      href: `/${locale}/dashboard/agents/new`,
      icon: Brain,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50',
    },
    {
      key: 'checkFirewall',
      name: t('checkFirewall'),
      href: `/${locale}/dashboard/firewall`,
      icon: Shield,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50',
    },
    {
      key: 'startChat',
      name: t('startChat'),
      href: `/${locale}/dashboard/chat`,
      icon: MessageSquare,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor:
        'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50',
    },
    {
      key: 'settings',
      name: t('settings'),
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor:
        'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Live Region for async/status announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {statusMsg || ''}
      </div>
      {actions.map((action) => (
        <Link
          key={action.key}
          href={action.href}
          className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${action.bgColor}`}
          onClick={() => setStatusMsg(t('statusNavigating', { target: action.name }))}
          onFocus={() => setStatusMsg(t('statusFocused', { target: action.name }))}
        >
          <action.icon className={`h-5 w-5 ${action.color}`} />
          <span className="text-sm font-medium text-foreground">{action.name}</span>
        </Link>
      ))}

      <div className="pt-3 border-t">
        <Link
          href={`/${locale}/dashboard/tools`}
          className="flex items-center space-x-3 w-full p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setStatusMsg(t('statusNavigating', { target: t('moreTools') }))}
          onFocus={() => setStatusMsg(t('statusFocused', { target: t('moreTools') }))}
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium">{t('moreTools')}</span>
        </Link>
      </div>
    </div>
  );
}
