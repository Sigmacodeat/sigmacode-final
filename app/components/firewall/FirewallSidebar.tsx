'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  label: string;
  description?: string;
  icon?: string;
}

export function FirewallSidebar() {
  const pathname = usePathname();
  const t = useTranslations('firewall.sidebar');
  const currentPath = pathname ? pathname.split('/').pop() || '' : '';

  const navItems: NavItem[] = [
    {
      href: './policies',
      label: t('policies'),
      description: t('policiesDesc'),
      icon: '📋',
    },
    {
      href: './config',
      label: t('config'),
      description: t('configDesc'),
      icon: '⚙️',
    },
    {
      href: '../monitor',
      label: t('logs'),
      description: t('logsDesc'),
      icon: '📊',
    },
    {
      href: '../stats',
      label: t('stats'),
      description: t('statsDesc'),
      icon: '📈',
    },
  ];

  return (
    <div className="w-64 bg-gray-50 dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname && currentPath === item.href.split('/').pop();
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                {item.description && <div className="text-xs opacity-75">{item.description}</div>}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
