/**
 * SIGMACODE AI - Recent Activity (live)
 *
 * Bindet sich an SSE-Stream /api/firewall/stream und zeigt Events an
 */

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Brain, Shield, MessageSquare, Settings, Activity } from 'lucide-react';
import { useSSE } from '@/app/hooks/useSSE';

type FirewallEvent = {
  id: string;
  ts: string;
  phase?: 'pre' | 'post' | 'shadow' | 'shadow_error' | 'error';
  requestId?: string;
  backend?: string;
  status?: number;
  ok?: boolean;
  latency?: number;
  mode?: 'enforce' | 'shadow' | 'off';
  message?: string;
};

function iconForPhase(phase?: string) {
  switch (phase) {
    case 'pre':
      return { Icon: Shield, color: 'text-green-600', bg: 'bg-green-100' };
    case 'post':
      return { Icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'shadow':
      return { Icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' };
    case 'shadow_error':
    case 'error':
      return { Icon: Shield, color: 'text-red-600', bg: 'bg-red-100' };
    default:
      return { Icon: Activity, color: 'text-zinc-600', bg: 'bg-zinc-100' };
  }
}

export function RecentActivity() {
  const t = useTranslations('dashboard.activity');
  const params = useParams();
  const locale = (params?.locale as string) || '';
  const { messages, connected } = useSSE('/api/firewall/stream');

  const events = useMemo(() => {
    return messages
      .map((m) => m.data as any)
      .filter((d) => d && (d.phase || d.message || d.requestId))
      .slice(-20)
      .reverse() as FirewallEvent[];
  }, [messages]);

  return (
    <div className="space-y-4">
      {events.length === 0 && (
        <div className="text-sm text-muted-foreground">
          {connected ? t('noEvents') : t('connecting')}
        </div>
      )}
      {events.map((e) => {
        const { Icon, color, bg } = iconForPhase(e.phase);
        return (
          <div
            key={e.id + e.ts}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {e.message ||
                  `Phase: ${e.phase ?? 'unknown'} • Status: ${e.status ?? '-'} • ${e.ok ? 'OK' : 'Fail'}`}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {new Date(e.ts).toLocaleString()} • Req {e.requestId ?? 'n/a'} • Mode{' '}
                {e.mode ?? '-'} • Lat {e.latency ?? '-'}ms
              </p>
            </div>
          </div>
        );
      })}
      <div className="pt-4 border-t">
        <Link
          href={`/${locale}/dashboard/monitoring`}
          className="w-full inline-block text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {t('viewAll')}
        </Link>
      </div>
    </div>
  );
}
