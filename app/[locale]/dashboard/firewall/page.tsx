/**
 * SIGMACODE AI - Firewall Dashboard
 *
 * Übersicht über die Neural Firewall und Sicherheitseinstellungen
 */

import { Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

export const metadata = {
  title: 'Neural Firewall | SIGMACODE AI',
  description: 'Überwachen Sie Ihre Firewall und Sicherheitseinstellungen',
};

export default function FirewallPage() {
  const firewallStatus = {
    enabled: true,
    mode: 'enforce', // 'shadow' | 'enforce' | 'off'
    requestsToday: 1247,
    blockedToday: 23,
    threatsDetected: 5,
  };

  const recentEvents = [
    {
      id: 1,
      type: 'blocked',
      message: 'SQL Injection Versuch blockiert',
      time: 'vor 2 Minuten',
      severity: 'high',
    },
    {
      id: 2,
      type: 'blocked',
      message: 'XSS-Angriff erkannt',
      time: 'vor 15 Minuten',
      severity: 'medium',
    },
    {
      id: 3,
      type: 'allowed',
      message: 'Normale API-Anfrage',
      time: 'vor 32 Minuten',
      severity: 'low',
    },
    {
      id: 4,
      type: 'blocked',
      message: 'Rate Limit überschritten',
      time: 'vor 1 Stunde',
      severity: 'medium',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Neural Firewall</h1>
        </div>
        <p className="text-muted-foreground">
          Überwachen Sie Ihre Firewall und schützen Sie Ihre Anwendungen vor Bedrohungen
        </p>
        <DashboardBreadcrumbs />
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {firewallStatus.enabled ? 'Aktiv' : 'Inaktiv'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Anfragen heute</p>
              <p className="text-2xl font-semibold text-foreground">
                {firewallStatus.requestsToday.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Blockiert heute</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {firewallStatus.blockedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Bedrohungen</p>
              <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                {firewallStatus.threatsDetected}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Firewall Mode */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Firewall-Modus</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${firewallStatus.mode === 'enforce' ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span>Enforce Mode</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {firewallStatus.mode === 'enforce' ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${firewallStatus.mode === 'shadow' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                />
                <span>Shadow Mode</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {firewallStatus.mode === 'shadow' ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Kürzliche Ereignisse</h3>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <div
                  className={`p-1 rounded-full ${
                    event.type === 'blocked'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}
                >
                  {event.type === 'blocked' ? (
                    <AlertTriangle
                      className={`h-3 w-3 ${
                        event.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                      }`}
                    />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.message}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
