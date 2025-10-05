'use client';

/**
 * SIGMACODE AI - Agents Liste (Full Page)
 *
 * Vollständige Agent-Verwaltung mit Filter, Suche, CRUD
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Brain, Shield, Search, Trash2, Edit, Play, Plus } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  firewallEnabled: boolean;
  firewallPolicy: string;
  modelTier: string | null;
  createdAt: string;
  updatedAt: string;
}

export function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      logger.error({ error }, 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  }

  async function deleteAgent(id: string) {
    if (!confirm('Agent wirklich löschen?')) return;

    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAgents(agents.filter((a) => a.id !== id));
      }
    } catch (error) {
      logger.error({ error }, 'Failed to delete agent');
    }
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-accent animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Agents durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Agent Cards */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Agents gefunden</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'Versuchen Sie eine andere Suche' : 'Erstellen Sie Ihren ersten Agent'}
          </p>
          {!searchQuery && (
            <Link
              href="/dashboard/agents/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Agent erstellen</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    {agent.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {agent.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Firewall Status */}
              <div className="flex items-center gap-2 mb-4">
                {agent.firewallEnabled ? (
                  <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <Shield className="h-3 w-3 mr-1" />
                    Firewall: {agent.firewallPolicy}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    <Shield className="h-3 w-3 mr-1" />
                    Firewall: Aus
                  </span>
                )}
                {agent.modelTier && (
                  <span className="inline-flex items-center text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {agent.modelTier}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Link
                  href={`/dashboard/agents/${agent.id}/execute`}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>Ausführen</span>
                </Link>
                <Link
                  href={`/dashboard/agents/${agent.id}/edit`}
                  className="p-2 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => deleteAgent(agent.id)}
                  className="p-2 border rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                Erstellt: {new Date(agent.createdAt).toLocaleDateString('de-DE')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
