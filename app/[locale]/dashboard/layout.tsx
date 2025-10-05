/**
 * SIGMACODE AI - Premium Dashboard Layout
 *
 * Shared Layout für alle Dashboard-Seiten mit Navigation
 * Design: Premium Background, Smooth Transitions, Optimized Spacing
 */

import { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Skip to content for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-gradient-to-r focus:from-primary focus:to-primary/90 focus:text-primary-foreground focus:px-6 focus:py-3 focus:rounded-xl focus:shadow-xl focus:ring-4 focus:ring-primary/50 font-semibold"
      >
        Zum Inhalt springen
      </a>

      {/* Left Sidebar Navigation */}
      <DashboardNav />

      {/* Premium Content area - leaves space for sidebar on md+ */}
      <main
        id="main-content"
        role="main"
        className="md:ml-64 lg:ml-72 px-4 sm:px-6 lg:px-8 py-8 min-h-screen"
      >
        <div className="mx-auto max-w-7xl">
          <DashboardTopBar />
          {children}
        </div>
      </main>
    </div>
  );
}
