'use client';

/**
 * SIGMACODE AI - Premium Firewall Status Widget
 *
 * HAUPT-USP-FEATURE: Live-Firewall-Status mit Toggle
 * Design: Glassmorphism, Premium Gradients, Smooth Animations
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Activity, AlertTriangle, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { logger } from '@/lib/logger';

interface FirewallStatus {
  enabled: boolean;
  mode: 'enforce' | 'shadow' | 'off';
  stats: {
    totalRequests: number;
    blocked: number;
    allowed: number;
    threats: number;
  };
}

export function FirewallStatusWidget() {
  const params = useParams();
  const locale = (params?.locale as string) || '';
  const [status, setStatus] = useState<FirewallStatus>({
    enabled: false,
    mode: 'off',
    stats: {
      totalRequests: 0,
      blocked: 0,
      allowed: 0,
      threats: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadFirewallStatus();
  }, []);

  async function loadFirewallStatus() {
    try {
      const res = await fetch('/api/firewall/stats');
      if (!res.ok) throw new Error(`Failed to fetch firewall stats: ${res.status}`);
      const data = await res.json();

      // Defensive normalization to avoid undefined stats
      setStatus((prev) => ({
        enabled: Boolean(data?.enabled),
        mode: (data?.mode as FirewallStatus['mode']) ?? 'off',
        stats: {
          totalRequests: Number(data?.stats?.totalRequests ?? 0),
          blocked: Number(data?.stats?.blocked ?? 0),
          allowed: Number(data?.stats?.allowed ?? 0),
          threats: Number(data?.stats?.threats ?? 0),
        },
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to load firewall status');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFirewall() {
    setToggling(true);
    try {
      const newMode = status.enabled ? 'off' : 'enforce';
      const res = await fetch('/api/firewall/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !status.enabled,
          mode: newMode,
        }),
      });

      if (res.ok) {
        await loadFirewallStatus();
      }
    } catch (error) {
      logger.error({ error }, 'Failed to toggle firewall');
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative space-y-4">
          <div className="h-10 w-64 bg-white/20 animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/20 backdrop-blur-sm animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isActive = status.enabled && status.mode !== 'off';
  const blockRate =
    status.stats.totalRequests > 0
      ? ((status.stats.blocked / status.stats.totalRequests) * 100).toFixed(1)
      : '0.0';

  return (
    <div
      className={`relative rounded-2xl p-8 text-white overflow-hidden shadow-2xl transition-all duration-500 ${
        isActive
          ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600'
          : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700'
      }`}
    >
      {/* Premium Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse" />
      </div>

      {/* Animated Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10">
        {/* Premium Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`relative p-4 rounded-2xl backdrop-blur-xl ${
                isActive ? 'bg-white/20 shadow-lg shadow-white/20' : 'bg-white/10'
              }`}
            >
              <Shield className="h-10 w-10 drop-shadow-lg" />
              {isActive && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-white shadow-lg"></span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                AI Firewall
                {isActive && <Sparkles className="h-6 w-6 text-white/90 animate-pulse" />}
              </h2>
              <p className="text-white/90 text-sm font-medium">
                {isActive ? '✓ Aktiv und schützt deine Agents' : '⚠️ Nicht aktiv'}
              </p>
            </div>
          </div>

          {/* PREMIUM MASTER TOGGLE - KILLER FEATURE! */}
          <button
            onClick={toggleFirewall}
            disabled={toggling}
            className={`group relative inline-flex h-14 w-28 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg ${
              isActive ? 'bg-white/30 hover:bg-white/40' : 'bg-white/10 hover:bg-white/20'
            } ${toggling ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105'}`}
            aria-label={isActive ? 'Firewall deaktivieren' : 'Firewall aktivieren'}
          >
            <span
              className={`inline-flex items-center justify-center h-12 w-12 transform rounded-full bg-white shadow-2xl transition-all duration-300 ${
                isActive ? 'translate-x-14' : 'translate-x-1'
              }`}
            >
              {isActive ? (
                <CheckCircle className="h-8 w-8 text-emerald-600 drop-shadow-lg" />
              ) : (
                <XCircle className="h-8 w-8 text-slate-400" />
              )}
            </span>
            {toggling && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white/10 backdrop-blur-xl rounded-xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-sm font-medium">Anfragen</span>
              <Activity className="h-5 w-5 text-white/80 group-hover:animate-pulse" />
            </div>
            <p className="text-4xl font-bold mb-1">{status.stats.totalRequests.toLocaleString()}</p>
            <p className="text-xs text-white/70">Gesamt verarbeitet</p>
          </div>

          <div className="group bg-white/10 backdrop-blur-xl rounded-xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-sm font-medium">Blockiert</span>
              <XCircle className="h-5 w-5 text-white/80 group-hover:animate-pulse" />
            </div>
            <p className="text-4xl font-bold mb-1">{status.stats.blocked.toLocaleString()}</p>
            <p className="text-xs text-white/70">{blockRate}% Block-Rate</p>
          </div>

          <div className="group bg-white/10 backdrop-blur-xl rounded-xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-sm font-medium">Erlaubt</span>
              <CheckCircle className="h-5 w-5 text-white/80 group-hover:animate-pulse" />
            </div>
            <p className="text-4xl font-bold mb-1">{status.stats.allowed.toLocaleString()}</p>
            <p className="text-xs text-white/70">Sichere Anfragen</p>
          </div>

          <div className="group bg-white/10 backdrop-blur-xl rounded-xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-sm font-medium">Bedrohungen</span>
              <AlertTriangle className="h-5 w-5 text-white/80 group-hover:animate-pulse" />
            </div>
            <p className="text-4xl font-bold mb-1">{status.stats.threats.toLocaleString()}</p>
            <p className="text-xs text-white/70">Erkannte Threats</p>
          </div>
        </div>

        {/* Premium Mode Badge & Link */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-white/90 font-medium">Modus:</span>
            <span
              className={`px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-xl border border-white/20 shadow-lg ${
                status.mode === 'enforce'
                  ? 'bg-white/25 text-white'
                  : status.mode === 'shadow'
                    ? 'bg-yellow-500/30 text-yellow-50'
                    : 'bg-white/10 text-white/70'
              }`}
            >
              {status.mode === 'enforce'
                ? '🛡️ Enforce (Blockieren)'
                : status.mode === 'shadow'
                  ? '👁️ Shadow (Beobachten)'
                  : '⚠️ Aus'}
            </span>
          </div>
          <a
            href={`/${locale}/dashboard/firewall`}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl text-sm font-medium text-white transition-all duration-300 hover:shadow-lg border border-white/10"
          >
            Erweiterte Einstellungen
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
