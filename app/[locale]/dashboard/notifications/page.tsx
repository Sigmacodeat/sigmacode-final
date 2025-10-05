'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Trash2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [connected, setConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items],
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const clearAll = async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setItems([]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.addEventListener('notification', (evt: MessageEvent) => {
      try {
        const data = JSON.parse(evt.data);
        setItems((prev) => [
          {
            id: data.id ?? `${Date.now()}`,
            type: (data.type as any) ?? 'info',
            title: data.title ?? 'Notification',
            message: data.message ?? 'New event',
            read: false,
            createdAt: data.createdAt ?? new Date().toISOString(),
          },
          ...prev,
        ]);
      } catch {}
    });
    return () => es.close();
  }, []);

  const pill = (n: NotificationItem) => {
    switch (n.type) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">Realtime updates via Server-Sent Events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
              connected
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}
          >
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? 'Live' : 'Disconnected'}
          </span>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-4">
        {sorted.map((n) => (
          <div key={n.id} className={`bg-card rounded-lg border p-4 ${n.read ? 'opacity-75' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className={`text-[10px] px-2 py-1 rounded-full ${pill(n)}`}>{n.type}</span>
                <div>
                  <h3 className="font-medium">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                  >
                    <CheckCircle2 className="h-4 w-4 inline-block mr-1" />
                    Mark read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">Events werden hier in Echtzeit erscheinen</p>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          API:{' '}
          <Link href={`/${locale}/api/notifications`} className="underline">
            /{locale}/api/notifications
          </Link>
        </p>
      </div>
    </div>
  );
}
