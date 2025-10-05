'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { streamChat, type ChatMessage } from './lib/streamingClient';
import ReactMarkdown from 'react-markdown';
import { X, Send, StopCircle, RotateCcw } from 'lucide-react';
import { getAnalytics } from '@/app/lib/analytics';
import ToolCallRenderer from './components/ToolCallRenderer';

export default function RichChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [threadId] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  type Thread = { id: string; name: string; messages: ChatMessage[]; updatedAt: string };
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd]);

  // Load threads from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rich_chat_threads_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as Thread[];
        if (Array.isArray(parsed)) {
          setThreads(parsed);
          if (parsed.length > 0) {
            setCurrentThreadId(parsed[0].id);
            setMessages(parsed[0].messages || []);
          } else {
            // initialize first thread
            const initId =
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2);
            const init: Thread = {
              id: initId,
              name: 'Neuer Thread',
              messages: [],
              updatedAt: new Date().toISOString(),
            };
            setThreads([init]);
            setCurrentThreadId(initId);
          }
        }
      } else {
        const initId =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);
        const init: Thread = {
          id: initId,
          name: 'Neuer Thread',
          messages: [],
          updatedAt: new Date().toISOString(),
        };
        setThreads([init]);
        setCurrentThreadId(initId);
      }
    } catch {}
  }, []);

  // Persist threads on change
  useEffect(() => {
    try {
      localStorage.setItem('rich_chat_threads_v1', JSON.stringify(threads));
    } catch {}
  }, [threads]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    setAtBottom(nearBottom);
  };

  const sessionId = useMemo(
    () =>
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    [],
  );

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      metadata: attachments.length
        ? {
            attachments: attachments.map((f) => ({ name: f.name, type: f.type, size: f.size })),
          }
        : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    // also update in threads
    setThreads((prev) =>
      prev.map((t) =>
        t.id === currentThreadId
          ? { ...t, messages: [...t.messages, userMsg], updatedAt: new Date().toISOString() }
          : t,
      ),
    );
    setInput('');
    setAttachments([]);

    const botId = Math.random().toString(36).slice(2);
    setMessages((prev) => [
      ...prev,
      { id: botId, role: 'assistant', content: '', timestamp: new Date().toISOString() },
    ]);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === currentThreadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: botId, role: 'assistant', content: '', timestamp: new Date().toISOString() },
              ],
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    );

    const abortCtrl = new AbortController();
    abortRef.current = abortCtrl;
    setIsStreaming(true);

    try {
      await streamChat(
        [...messages, userMsg],
        { sessionId, conversationStep: 'chat', userProfile: { threadId } },
        (delta) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, content: m.content + delta } : m)),
          );
          setThreads((prev) =>
            prev.map((t) =>
              t.id === currentThreadId
                ? {
                    ...t,
                    messages: t.messages.map((m) =>
                      m.id === botId ? { ...m, content: (m.content || '') + delta } : m,
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : t,
            ),
          );
        },
        abortCtrl.signal,
      );
      setIsStreaming(false);
      abortRef.current = null;
      getAnalytics().trackEvent({
        name: 'rich_chat_message_completed',
        category: 'chat',
        action: 'completed',
        label: threadId,
      });
    } catch (e: any) {
      setIsStreaming(false);
      const aborted = e?.name === 'AbortError';
      abortRef.current = null;
      getAnalytics().trackEvent({
        name: aborted ? 'rich_chat_aborted' : 'rich_chat_failed',
        category: 'chat',
        action: aborted ? 'aborted' : 'failed',
        label: threadId,
      });
    }
  };

  const stop = () => {
    try {
      abortRef.current?.abort();
    } finally {
      setIsStreaming(false);
    }
  };

  const retryLast = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        send(messages[i].content);
        break;
      }
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Threads Toolbar */}
      <div className="mb-4 flex items-center gap-2">
        <select
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
          value={currentThreadId}
          onChange={(e) => {
            const id = e.target.value;
            setCurrentThreadId(id);
            const t = threads.find((th) => th.id === id);
            setMessages(t?.messages || []);
          }}
        >
          {threads.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
          onClick={() => {
            const id =
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2);
            const t: Thread = {
              id,
              name: `Thread ${threads.length + 1}`,
              messages: [],
              updatedAt: new Date().toISOString(),
            };
            setThreads((prev) => [t, ...prev]);
            setCurrentThreadId(id);
            setMessages([]);
          }}
        >
          Neu
        </button>
        <button
          className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
          onClick={() => {
            const name = prompt(
              'Neuer Name für Thread?',
              threads.find((t) => t.id === currentThreadId)?.name || '',
            );
            if (name && name.trim()) {
              setThreads((prev) =>
                prev.map((t) =>
                  t.id === currentThreadId
                    ? { ...t, name: name.trim(), updatedAt: new Date().toISOString() }
                    : t,
                ),
              );
            }
          }}
        >
          Umbenennen
        </button>
        <button
          className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
          onClick={() => {
            if (!confirm('Thread wirklich löschen?')) return;
            setThreads((prev) => prev.filter((t) => t.id !== currentThreadId));
            const next = threads.find((t) => t.id !== currentThreadId);
            if (next) {
              setCurrentThreadId(next.id);
              setMessages(next.messages);
            } else {
              setCurrentThreadId('');
              setMessages([]);
            }
          }}
        >
          Löschen
        </button>
        <button
          className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
          onClick={() => {
            try {
              const t = threads.find((th) => th.id === currentThreadId);
              if (!t) return;
              const blob = new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `thread-${t.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            } catch {}
          }}
        >
          Export
        </button>
      </div>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat</h1>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {isStreaming ? (
            <button
              onClick={stop}
              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-red-600 border-red-300"
            >
              <StopCircle className="h-4 w-4" /> Stop
            </button>
          ) : (
            <button
              onClick={retryLast}
              className="inline-flex items-center gap-1 rounded border px-2 py-1 border-slate-300"
            >
              <RotateCcw className="h-4 w-4" /> Wiederholen
            </button>
          )}
        </div>
      </header>

      <section
        ref={containerRef}
        onScroll={handleScroll}
        className="min-h-[60vh] max-h-[65vh] overflow-y-auto rounded border border-slate-200 p-4 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        {messages.map((m) => (
          <div key={m.id} className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'}`}
            >
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              {m.role === 'assistant' && (
                <ToolCallRenderer
                  content={m.content}
                  onApprove={({ name, args }) => {
                    try {
                      getAnalytics().trackEvent({
                        name: 'tool_call_approved',
                        category: 'chat',
                        action: 'approve',
                        label: name || 'unknown',
                        customData: { args },
                      });
                    } catch {}
                    // PoC: Log approval into the chat timeline
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: Math.random().toString(36).slice(2),
                        role: 'system',
                        content: `✔ Tool '${name ?? 'unknown'}' approved`,
                        timestamp: new Date().toISOString(),
                      },
                    ]);
                    setThreads((prev) =>
                      prev.map((t) =>
                        t.id === currentThreadId
                          ? {
                              ...t,
                              messages: [
                                ...t.messages,
                                {
                                  id: Math.random().toString(36).slice(2),
                                  role: 'system',
                                  content: `✔ Tool '${name ?? 'unknown'}' approved`,
                                  timestamp: new Date().toISOString(),
                                },
                              ],
                              updatedAt: new Date().toISOString(),
                            }
                          : t,
                      ),
                    );
                  }}
                  onReject={({ name, args }) => {
                    try {
                      getAnalytics().trackEvent({
                        name: 'tool_call_rejected',
                        category: 'chat',
                        action: 'reject',
                        label: name || 'unknown',
                        customData: { args },
                      });
                    } catch {}
                    // PoC: Log rejection into the chat timeline
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: Math.random().toString(36).slice(2),
                        role: 'system',
                        content: `✖ Tool '${name ?? 'unknown'}' rejected`,
                        timestamp: new Date().toISOString(),
                      },
                    ]);
                    setThreads((prev) =>
                      prev.map((t) =>
                        t.id === currentThreadId
                          ? {
                              ...t,
                              messages: [
                                ...t.messages,
                                {
                                  id: Math.random().toString(36).slice(2),
                                  role: 'system',
                                  content: `✖ Tool '${name ?? 'unknown'}' rejected`,
                                  timestamp: new Date().toISOString(),
                                },
                              ],
                              updatedAt: new Date().toISOString(),
                            }
                          : t,
                      ),
                    );
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </section>

      {!atBottom && (
        <div className="mt-2 text-right">
          <button
            onClick={scrollToEnd}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            Nach unten
          </button>
        </div>
      )}

      <footer className="mt-4 flex flex-col gap-2">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {attachments.map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-600"
              >
                {f.name} ({Math.ceil(f.size / 1024)} KB)
                <button
                  className="ml-1 text-slate-500 hover:text-slate-700"
                  onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label="Attachment entfernen"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-2">
          {/* File input */}
          <label className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 dark:border-slate-600 dark:text-slate-300">
            Datei hinzufügen
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Simple prechecks: type/size
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                  // eslint-disable-next-line no-alert
                  alert('Datei zu groß (max. 5MB)');
                  return;
                }
                setAttachments((prev) => [...prev, file]);
                e.currentTarget.value = '';
              }}
            />
          </label>

          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Nachricht eingeben..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            {input && (
              <button
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => send()}
            disabled={!input.trim() || isStreaming}
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-3 text-white disabled:opacity-50"
          >
            <Send className="h-5 w-5" /> Senden
          </button>
        </div>
      </footer>
    </main>
  );
}
