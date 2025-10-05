'use client';

/**
 * SIGMACODE AI - Premium Dashboard Overview
 *
 * Hauptübersicht mit Metriken, Agent-Liste und Firewall-Status
 * Design: Premium Glassmorphism, Micro-Interactions, Agency-Level Quality
 */

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  Brain,
  Workflow,
  Shield,
  Activity,
  TrendingUp,
  MessageSquare,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { FirewallStatusWidget } from '@/components/firewall/FirewallStatusWidget';
import { HandbookWidget } from '@/components/dashboard/HandbookWidget';
import { AgentListWidget } from '@/components/agents/AgentListWidget';
import { logger } from '@/lib/logger';
// Breadcrumbs werden nun zentral in der DashboardTopBar gerendert
// import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  agents: number;
  workflows: number;
  executions: number;
  firewallBlocked: number;
}

export function DashboardOverview() {
  const t = useTranslations('dashboard.overview');
  const params = useParams();
  const locale = (params?.locale as string) || '';
  const [stats, setStats] = useState<DashboardStats>({
    agents: 0,
    workflows: 0,
    executions: 0,
    firewallBlocked: 0,
  });
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Lade Daten nur, wenn Session wirklich authentifiziert ist
    if (status === 'authenticated' && session?.user) {
      loadStats();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
    // Bei 'loading' warten wir, bis NextAuth den Status auflöst
  }, [status, session]);

  async function loadStats() {
    // Double-check that we have a valid session before making API calls
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      // Load agents count
      const agentsRes = await fetch('/api/agents');
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setStats((prev) => ({
          ...prev,
          agents: agentsData.total || 0,
        }));
      } else if (agentsRes.status === 401) {
        // User not authenticated, keep agents at 0
        setStats((prev) => ({ ...prev, agents: 0 }));
      }

      // TODO: Load other stats from respective APIs
      // For now, keep other stats at 0
    } catch (error) {
      logger.error({ error }, 'Failed to load dashboard stats');
      // Keep stats at 0 on error
    } finally {
      setLoading(false);
    }
  }

  // Memoized stat cards für bessere Performance
  const statCards = useMemo(
    () => [
      {
        name: t('aiAgents'),
        value: stats.agents,
        icon: Brain,
        gradient: 'from-blue-500 to-cyan-500',
        glowColor: 'rgba(59, 130, 246, 0.3)',
        trend: '+12%',
        description: t('activeAgents'),
      },
      {
        name: t('workflows'),
        value: stats.workflows,
        icon: Workflow,
        gradient: 'from-purple-500 to-pink-500',
        glowColor: 'rgba(168, 85, 247, 0.3)',
        trend: '+8%',
        description: t('automations'),
      },
      {
        name: t('executions'),
        value: stats.executions,
        icon: Zap,
        gradient: 'from-emerald-500 to-teal-500',
        glowColor: 'rgba(16, 185, 129, 0.3)',
        trend: '+24%',
        description: t('executedToday'),
      },
      {
        name: t('firewall'),
        value: stats.firewallBlocked,
        icon: Shield,
        gradient: 'from-red-500 to-orange-500',
        glowColor: 'rgba(239, 68, 68, 0.3)',
        trend: '-5%',
        description: t('threatsBlocked'),
      },
    ],
    [stats, t],
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-10 w-48 bg-gradient-to-r from-muted to-muted/50 animate-shimmer rounded-lg" />
          <div className="h-4 w-96 bg-gradient-to-r from-muted to-muted/50 animate-shimmer rounded" />
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-gradient-to-br from-card to-card/80 border border-border/50 animate-pulse rounded-xl shadow-sm"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title with Premium Styling (Breadcrumbs sind in der Top-Bar) */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-brand-500/20">
              <Sparkles className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t('title')}
              </h1>
            </div>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl">{t('subtitle')}</p>
        </div>
      </div>
      {/* Premium Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.name}
            className="group relative bg-gradient-to-br from-card to-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 hover:border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient Glow Effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at top right, ${stat.glowColor}, transparent 70%)`,
              }}
            />

            {/* Content */}
            <div className="relative space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.name}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl lg:text-4xl font-bold tracking-tight">{stat.value}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        stat.trend.startsWith('+')
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid - Optimized Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Firewall Status - HERO USP! Volle Breite zuerst */}
        <div className="lg:col-span-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <FirewallStatusWidget />
        </div>

        {/* Agent Liste - 2 Spalten */}
        <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <AgentListWidget />
        </div>
        {/* Premium Quick Actions (zentralisierte Komponente) */}
        <div className="animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              {t('quickActions')}
            </h3>
            <div className="space-y-2">
              <QuickActions />
            </div>

            {/* Activity Feed */}
            <div className="pt-6 border-t border-border/50">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                {t('recentActivity')}
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="text-center py-4 text-muted-foreground/70">{t('noActivities')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Handbook Widget - Full Width */}
        <div className="lg:col-span-3 animate-fade-up" style={{ animationDelay: '500ms' }}>
          <HandbookWidget />
        </div>
      </div>
    </div>
  );
}
