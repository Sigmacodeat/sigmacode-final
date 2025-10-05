'use client';

import { useEffect, useRef, useState } from 'react';

export type SSEMessage = { event?: string; data: any };

export function useSSE(url: string, opts: { withCredentials?: boolean } = {}) {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setMessages([]);
    setConnected(false);
    setError(null);

    const es = new EventSource(url, { withCredentials: !!opts.withCredentials });
    esRef.current = es;

    const onOpen = () => setConnected(true);
    const onError = () => {
      setConnected(false);
      setError('SSE Verbindung unterbrochen');
    };

    const onMessage = (ev: MessageEvent) => {
      setMessages((prev) => [...prev, { data: safeParse(ev.data) }]);
    };

    es.addEventListener('open', onOpen as any);
    es.addEventListener('error', onError as any);
    es.addEventListener('message', onMessage as any);

    return () => {
      es.removeEventListener('open', onOpen as any);
      es.removeEventListener('error', onError as any);
      es.removeEventListener('message', onMessage as any);
      es.close();
      esRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { messages, connected, error };
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
