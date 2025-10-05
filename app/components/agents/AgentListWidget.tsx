'use client';

/**
 * SIGMACODE AI - Premium Agent List Widget
 *
 * Zeigt die neuesten Agents mit Firewall-Status
 * Design: Glassmorphism Cards, Hover Effects, Premium Layout
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Brain, Plus, Shield, ChevronRight, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useSession } from 'next-auth/react';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  firewallEnabled: boolean;
  firewallPolicy: string;
  createdAt: string;
}

export function AgentListWidget() {
  const params = useParams();
  const locale = (params?.locale as string) || '';
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadAgents();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  async function loadAgents() {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents?.slice(0, 5) || []);
      } else if (res.status === 401) {
        setAgents([]);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-lg">
        <div className="h-8 w-40 bg-gradient-to-r from-muted to-muted/50 animate-shimmer rounded-lg mb-6" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-xl"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Meine AI Agents</h3>
        </div>
        <Link
          href={`/${locale}/dashboard/agents`}
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Alle ansehen
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-2xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <Brain className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-muted-foreground mb-6 text-base">Noch keine Agents erstellt</p>
          <Link
            href={`/${locale}/dashboard/agents/new`}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            <span>Ersten Agent erstellen</span>
            <Sparkles className="h-4 w-4 opacity-80" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent, index) => (
            <Link
              key={agent.id}
              href={`/${locale}/dashboard/agents/${agent.id}`}
              className="group block p-5 rounded-xl border border-border/50 bg-gradient-to-br from-background to-background/50 hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  <div className="relative">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/50 transition-shadow">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    {agent.firewallEnabled && (
                      <div className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors">
                      {agent.name}
                    </h4>
                    {agent.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {agent.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {agent.firewallEnabled ? (
                        <span className="inline-flex items-center text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg font-medium border border-green-500/20">
                          <Shield className="h-3.5 w-3.5 mr-1.5" />
                          Firewall: {agent.firewallPolicy}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-lg font-medium">
                          <Shield className="h-3.5 w-3.5 mr-1.5" />
                          Firewall: Aus
                        </span>
                      )}
                      <span className="inline-flex items-center text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium">
                        <Zap className="h-3.5 w-3.5 mr-1.5" />
                        Aktiv
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
