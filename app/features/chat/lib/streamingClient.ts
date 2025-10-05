'use client';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  // optional metadata passthrough
  metadata?: Record<string, any>;
};

export type StreamOptions = {
  sessionId: string;
  userProfile?: Record<string, any>;
  conversationStep?: string;
};

/**
 * streamChat
 * Lightweight SSE-style reader for our POST /api/sigmacode-ai/stream endpoint
 */
export async function streamChat(
  messages: ChatMessage[],
  opts: StreamOptions,
  onToken: (delta: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/sigmacode-ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      sessionId: opts.sessionId,
      messages: messages.map((m) => ({
        role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
        content: m.content,
        metadata: m.metadata || {},
      })),
      userProfile: opts.userProfile,
      conversationStep: opts.conversationStep,
      analytics: {
        messagesSent: messages.length,
        sessionStart: Date.now(),
      },
    }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new Error(text || 'Chat backend error');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let remainder = '';

  while (!done) {
    const { value, done: d } = await reader.read();
    done = d;
    const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
    remainder += chunk;

    let idx: number;
    while ((idx = remainder.indexOf('\n\n')) !== -1) {
      const line = remainder.slice(0, idx).trim();
      remainder = remainder.slice(idx + 2);
      if (!line) continue;
      const dataPrefix = 'data:';
      const payloadStr = line.startsWith(dataPrefix) ? line.slice(dataPrefix.length).trim() : line;
      if (payloadStr === '[DONE]') continue;
      try {
        const payload = JSON.parse(payloadStr);
        const delta: string =
          payload?.answer || payload?.output_text || payload?.data || payload?.text || '';
        if (delta) onToken(delta);
      } catch {
        // plain text fallback
        onToken(payloadStr);
      }
    }
  }
}
