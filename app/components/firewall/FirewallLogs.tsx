'use client';

/**
 * SIGMACODE AI - Firewall Logs Viewer
 */

import { useEffect, useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { logger } from '@/lib/logger';

interface FirewallLog {
  id: string;
  timestamp: string;
  action: 'blocked' | 'allowed';
  reason: string;
  threat: string | null;
  requestId: string;
}

export function FirewallLogs() {
  const [logs, setLogs] = useState<FirewallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const res = await fetch('/api/firewall/logs?limit=10');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      logger.error({ error }, 'Failed to load firewall logs');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Aktuelle Logs</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-accent animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Aktuelle Logs</h3>
        <a href="/dashboard/firewall/logs" className="text-sm text-primary hover:underline">
          Alle Logs →
        </a>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Firewall-Aktivitäten</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                log.action === 'blocked'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              {log.action === 'blocked' ? (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {log.action === 'blocked' ? 'Blockiert' : 'Erlaubt'}
                  </p>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(log.timestamp).toLocaleString('de-DE')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{log.reason}</p>
                {log.threat && <p className="text-xs text-red-600 mt-1">Bedrohung: {log.threat}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
