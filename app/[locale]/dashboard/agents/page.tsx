/**
 * SIGMACODE AI - Agents Übersicht
 *
 * Liste aller Agents mit Filter und Suche
 */

import { Suspense } from 'react';
import { AgentsList } from '@/components/agents/AgentsList';
import { Plus } from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';
import Link from 'next/link';

export const metadata = {
  title: 'Agents | SIGMACODE AI',
  description: 'Manage your AI agents',
};

export default function AgentsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre AI-Agents und Workflows</p>
          <DashboardBreadcrumbs />
        </div>
        <Link
          href="/dashboard/agents/new"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Neuer Agent</span>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-12">Laden...</div>}>
        <AgentsList />
      </Suspense>
    </div>
  );
}
