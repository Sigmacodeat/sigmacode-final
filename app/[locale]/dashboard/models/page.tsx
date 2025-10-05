/**
 * SIGMACODE AI - Model Provider Management
 * Vollständige LLM-Verwaltung wie in Dify
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Check, Settings, AlertCircle } from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';
import ProviderConfigModal from '@/app/components/models/ProviderConfigModal';

interface ModelProvider {
  provider: string;
  models: Array<{
    model: string;
    label: string;
    modelType: string;
  }>;
  configured: boolean;
}

export default function ModelsPage() {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configModal, setConfigModal] = useState<{ isOpen: boolean; provider: string | null }>({
    isOpen: false,
    provider: null,
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const handleConfigSuccess = () => {
    loadProviders(); // Reload providers to show updated status
    setConfigModal({ isOpen: false, provider: null });
  };

  async function loadProviders() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dify/console/api/workspaces/current/model-providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data);
      } else {
        // If API fails, show empty state instead of error
        setProviders([]);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
      setError('Failed to load model providers');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }

  const providerInfo = {
    openai: {
      name: 'OpenAI',
      icon: '🤖',
      color: 'from-green-500 to-emerald-500',
    },
    anthropic: {
      name: 'Anthropic (Claude)',
      icon: '🧠',
      color: 'from-orange-500 to-red-500',
    },
    azure_openai: {
      name: 'Azure OpenAI',
      icon: '☁️',
      color: 'from-blue-500 to-cyan-500',
    },
    google: {
      name: 'Google (Gemini)',
      icon: '🔷',
      color: 'from-blue-600 to-indigo-600',
    },
    huggingface: {
      name: 'Hugging Face',
      icon: '🤗',
      color: 'from-yellow-500 to-orange-500',
    },
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Model Provider</h1>
        </div>
        <p className="text-muted-foreground">Verwalten Sie Ihre LLM-Anbieter und API-Keys</p>
        <DashboardBreadcrumbs />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">Fehler beim Laden</h3>
            <p className="text-sm text-destructive/80">{error}</p>
            <button
              onClick={() => loadProviders()}
              className="mt-3 px-4 py-2 text-sm bg-destructive/20 hover:bg-destructive/30 rounded-lg transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(providerInfo).map(([key, info]) => {
            const provider = providers.find((p) => p.provider === key);
            return (
              <div
                key={key}
                className="group relative overflow-hidden"
                onClick={() => setConfigModal({ isOpen: true, provider: key })}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-10 group-hover:opacity-20 transition-all`}
                />
                <div className="relative bg-card rounded-xl p-6 border hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{info.icon}</span>
                      <h3 className="font-semibold text-lg">{info.name}</h3>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        provider?.configured
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {provider?.configured ? 'Konfiguriert' : 'Nicht konfiguriert'}
                    </div>
                  </div>

                  {provider?.configured && provider.models.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Verfügbare Modelle:</p>
                      <ul className="space-y-1">
                        {provider.models.slice(0, 3).map((model) => (
                          <li key={model.model} className="flex items-center space-x-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{model.label}</span>
                          </li>
                        ))}
                        {provider.models.length > 3 && (
                          <li className="text-sm text-muted-foreground">
                            +{provider.models.length - 3} weitere Modelle
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {!provider?.configured && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Settings className="h-4 w-4" />
                      <span>Klicken Sie zum Konfigurieren</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Provider Configuration Modal */}
      <ProviderConfigModal
        isOpen={configModal.isOpen}
        onClose={() => setConfigModal({ isOpen: false, provider: null })}
        provider={configModal.provider}
      />
    </div>
  );
}
