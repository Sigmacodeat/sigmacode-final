'use client';

/**
 * SIGMACODE AI - Firewall Cockpit
 *
 * HAUPT-USP: Vollständige Firewall-Kontrolle
 */

import { useEffect, useState } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  Globe,
  Lock,
  Unlock,
  Settings,
} from 'lucide-react';
import { FirewallPolicyEditor } from './FirewallPolicyEditor';
import { FirewallLogs } from './FirewallLogs';
import { logger } from '@/lib/logger';

interface FirewallConfig {
  enabled: boolean;
  mode: 'enforce' | 'shadow' | 'off';
  policies: {
    blockPromptInjection: boolean;
    blockDataLeaks: boolean;
    blockMaliciousUrls: boolean;
    enablePIIMasking: boolean;
  };
  stats: {
    totalRequests: number;
    blocked: number;
    allowed: number;
    threats: number;
    avgLatency: number;
  };
}

export function FirewallCockpit() {
  const [config, setConfig] = useState<FirewallConfig>({
    enabled: false,
    mode: 'off',
    policies: {
      blockPromptInjection: true,
      blockDataLeaks: true,
      blockMaliciousUrls: true,
      enablePIIMasking: false,
    },
    stats: {
      totalRequests: 0,
      blocked: 0,
      allowed: 0,
      threats: 0,
      avgLatency: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const [configRes, statsRes] = await Promise.all([
        fetch('/api/firewall/config'),
        fetch('/api/firewall/stats'),
      ]);

      const configData = await configRes.json();
      const statsData = await statsRes.json();

      setConfig({
        ...configData,
        stats: statsData.stats || config.stats,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to load firewall config');
    } finally {
      setLoading(false);
    }
  }

  async function updateConfig(updates: Partial<FirewallConfig>) {
    setSaving(true);
    try {
      const res = await fetch('/api/firewall/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig({ ...config, ...data });
      }
    } catch (error) {
      logger.error({ error }, 'Failed to update firewall config');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-accent animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-accent animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const isActive = config.enabled && config.mode !== 'off';
  const blockRate =
    config.stats.totalRequests > 0
      ? ((config.stats.blocked / config.stats.totalRequests) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div
        className={`rounded-lg p-8 text-white relative overflow-hidden ${
          isActive
            ? 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600'
            : 'bg-gradient-to-br from-gray-600 to-gray-700'
        }`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {isActive ? '🛡️ Firewall Aktiv' : '⚪ Firewall Inaktiv'}
              </h2>
              <p className="text-white/80">
                {isActive
                  ? `Modus: ${config.mode === 'enforce' ? 'Enforce (Blockiert)' : 'Shadow (Beobachtet)'}`
                  : 'Aktivieren Sie die Firewall zum Schutz Ihrer Agents'}
              </p>
            </div>

            {/* Master Toggle */}
            <button
              onClick={() =>
                updateConfig({
                  enabled: !config.enabled,
                  mode: !config.enabled ? 'enforce' : 'off',
                })
              }
              disabled={saving}
              className={`relative inline-flex h-16 w-32 items-center rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-white/50 ${
                isActive ? 'bg-white/30' : 'bg-white/10'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              <span
                className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-2xl transition-all duration-300 flex items-center justify-center ${
                  isActive ? 'translate-x-18' : 'translate-x-2'
                }`}
              >
                {isActive ? (
                  <Lock className="h-6 w-6 text-green-600" />
                ) : (
                  <Unlock className="h-6 w-6 text-gray-400" />
                )}
              </span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Activity className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{config.stats.totalRequests.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Anfragen</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Shield className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{config.stats.blocked.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Blockiert ({blockRate}%)</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <TrendingUp className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{config.stats.allowed.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Erlaubt</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{config.stats.threats.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Bedrohungen</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Clock className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{config.stats.avgLatency}ms</p>
              <p className="text-xs text-white/70 mt-1">Latenz Ø</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Firewall-Modus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              mode: 'enforce' as const,
              title: 'Enforce',
              description: 'Blockiert Bedrohungen aktiv',
              icon: Shield,
              color: 'border-green-500 bg-green-50',
            },
            {
              mode: 'shadow' as const,
              title: 'Shadow',
              description: 'Beobachtet ohne zu blockieren',
              icon: Activity,
              color: 'border-yellow-500 bg-yellow-50',
            },
            {
              mode: 'off' as const,
              title: 'Aus',
              description: 'Firewall deaktiviert',
              icon: Unlock,
              color: 'border-gray-300 bg-gray-50',
            },
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => updateConfig({ mode: option.mode, enabled: option.mode !== 'off' })}
              disabled={saving}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                config.mode === option.mode ? option.color : 'border-gray-200 hover:border-gray-300'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option.icon className="h-6 w-6 mb-2" />
              <h4 className="font-semibold">{option.title}</h4>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Policy Configuration */}
      <FirewallPolicyEditor
        policies={config.policies}
        onUpdate={(policies) => updateConfig({ policies })}
        disabled={saving}
      />

      {/* Recent Logs */}
      <FirewallLogs />
    </div>
  );
}
