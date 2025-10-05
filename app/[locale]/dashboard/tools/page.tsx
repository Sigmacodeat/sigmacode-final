/**
 * SIGMACODE AI - Tools Page
 */

'use client';

import { useEffect, useState } from 'react';
import { Wrench, ExternalLink, Check, X } from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';
import { InfoPanel, Tooltip } from '@/components/ui/handbook/HandbookComponents';

interface ApiTool {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  authType?: string;
  parameters?: Record<string, any>;
  isPublic?: boolean;
  requiresFirewall?: boolean;
}

interface ToolsApiResponse {
  tools: ApiTool[];
  total: number;
  categories: string[];
}

export default function ToolsPage() {
  const [tools, setTools] = useState<ApiTool[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTools();
  }, []);

  async function loadTools(selectedCategory?: string) {
    try {
      setError(null);
      const category = selectedCategory ?? filter;
      const qs = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`/api/tools${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ToolsApiResponse = await res.json();
      setTools(data.tools ?? []);
      // Kategorien nur initial setzen oder wenn Backend sie liefert
      const apiCategories = Array.isArray(data.categories) ? data.categories : [];
      setCategories(['all', ...apiCategories]);
    } catch (error) {
      console.error('Failed to load tools:', error);
      setError('Tools konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  // Serverseitige Filterung: API liefert bereits gefilterte Liste, clientseitig fallback
  const filteredTools = filter === 'all' ? tools : tools.filter((t) => t.category === filter);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tools</h1>
        <p className="text-gray-600">Verfügbare Integrationen und Tools für Ihre Agents</p>
        <DashboardBreadcrumbs />
      </div>

      {/* Info Panel */}
      <div className="mb-6">
        <InfoPanel title="Hinweis zu Kategorien & Auth" type="info">
          Wähle eine Kategorie, um passende Tools zu sehen. Einige Tools erfordern API‑Keys oder
          besondere Berechtigungen.
        </InfoPanel>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setFilter(category);
              setLoading(true);
              loadTools(category);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === category
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {category === 'all' ? 'Alle' : category}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-lg border p-6">
              <div className="h-12 w-12 bg-accent rounded-lg mb-4" />
              <div className="h-6 bg-accent rounded w-3/4 mb-2" />
              <div className="h-4 bg-accent rounded w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <X className="h-16 w-16 mx-auto text-red-400 mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Keine Tools gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
            >
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  {tool.isPublic && (
                    <Tooltip content="Öffentliches Tool – ohne spezielle Berechtigungen nutzbar">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                        Public
                      </span>
                    </Tooltip>
                  )}
                  {tool.requiresFirewall && (
                    <Tooltip content="Dieses Tool erfordert eine aktive Firewall-Policy">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                        Firewall
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
              {tool.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tool.description}</p>
              )}

              {/* Meta */}
              <div className="flex items-center justify-between text-sm">
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">{tool.category}</span>
                {tool.authType && <span className="text-gray-500">🔐 {tool.authType}</span>}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t">
                <button className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Konfigurieren →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
