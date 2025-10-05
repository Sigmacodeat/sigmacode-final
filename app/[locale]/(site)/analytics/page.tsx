import React from 'react';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { GlassCard } from '@/components/ui';

export const metadata = {
  title: 'Analytics | SIGMACODE AI',
  description:
    'Erweiterte Analytics mit Echtzeit-Einblicken in Performance und Nutzung Ihrer AI-Agents.',
};

export default function AnalyticsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Preview der neuen Dark-Blue Card */}
      <section className="mb-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <GlassCard variant="darkblue" className="p-6 hover:scale-[1.01] transition-transform">
            <h3 className="text-lg font-semibold">Responsible AI</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Governance, Transparenz und Evaluierung – dezente Dark-Optik mit blauen Akzenten.
            </p>
          </GlassCard>
        </div>
      </section>

      <AdvancedAnalytics />
    </main>
  );
}
