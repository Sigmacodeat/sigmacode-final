/**
 * Monitoring Overview Page
 */

'use client';

import Link from 'next/link';
import { Activity, ExternalLink, Server, Shield } from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3000';

export default function MonitoringPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Monitoring</h1>
      </div>
      <DashboardBreadcrumbs />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Firewall Dashboard</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Übersicht zu Anfragen, Block-Rate, Latenz und Top Threats.
          </p>
          <Link
            href={`${GRAFANA_URL}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            In Grafana öffnen <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Server className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">System Health</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Host-Metriken, Container-Auslastung und Service-Verfügbarkeit.
          </p>
          <Link
            href={`${GRAFANA_URL}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            In Grafana öffnen <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
