/**
 * Firewall Settings Page
 */

'use client';

import FirewallConfigForm from '@/components/firewall/FirewallConfigForm';
import RouteBindingsManager from '@/components/firewall/RouteBindingsManager';
import { Shield } from 'lucide-react';

export default function FirewallSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Neural Firewall – Einstellungen</h1>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <FirewallConfigForm />
      </div>

      <div className="mt-8 bg-card rounded-lg border p-6">
        <RouteBindingsManager />
      </div>
    </div>
  );
}
