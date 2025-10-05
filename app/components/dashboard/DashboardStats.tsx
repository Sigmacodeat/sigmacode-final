/**
 * SIGMACODE AI - Dashboard Stats
 *
 * Zeigt wichtige Statistiken im Dashboard an (i18n)
 */

import { Brain, Shield, Activity, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DashboardStats() {
  const t = useTranslations('dashboard.stats');

  const stats = [
    {
      name: t('aiAgents'),
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: Brain,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      name: t('firewallEvents'),
      value: '1,234',
      change: '+12%',
      changeType: 'increase',
      icon: Shield,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      name: t('apiRequests'),
      value: '45.2K',
      change: '+8%',
      changeType: 'increase',
      icon: Activity,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      name: t('systemHealth'),
      value: '98.5%',
      change: '+0.2%',
      changeType: 'increase',
      icon: Zap,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <div key={stat.name} className="bg-card rounded-lg border p-5 lg:p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <div className="mt-1 lg:mt-2 flex items-baseline">
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                <p
                  className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'increase'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.change}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
