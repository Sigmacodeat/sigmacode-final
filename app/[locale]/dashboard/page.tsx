/**
 * SIGMACODE AI - Dashboard Übersicht
 *
 * Hauptseite des Dashboards mit Übersicht über alle wichtigen Bereiche
 */

import { Suspense } from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export const metadata = {
  title: 'Dashboard | SIGMACODE AI',
  description: 'Dashboard Übersicht für SIGMACODE AI',
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          className="animate-pulse h-24 rounded-lg bg-accent"
          aria-busy="true"
          aria-live="polite"
        />
      }
    >
      <DashboardOverview />
    </Suspense>
  );
}
