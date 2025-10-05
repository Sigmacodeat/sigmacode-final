'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

interface UseChatOptions {
  endpoint?: string; // default: /api/sigmacode-ai
}

export function useChat(options?: UseChatOptions) {
  const endpoint = options?.endpoint || '/api/sigmacode-ai';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  );

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isSending) return;

      setError(null);
      setIsSending(true);

      const userMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { answer?: string; message?: string };
        const answer: string = data?.answer ?? data?.message ?? '';

        const botMsg: ChatMessage = {
          id: Math.random().toString(36).slice(2),
          role: 'assistant',
          content: answer || '',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (e: any) {
        setError(e?.message || 'Unbekannter Fehler');
      } finally {
        setIsSending(false);
      }
    },
    [endpoint, isSending, messages],
  );

  const api = useMemo(
    () => ({ send, messages, isSending, error }),
    [send, messages, isSending, error],
  );
  return api;
}
