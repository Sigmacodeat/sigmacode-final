/**
 * SIGMACODE AI - Chat Widget
 * Dify-kompatibles Chat-Interface mit Streaming
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  agentId?: string;
  conversationId?: string;
  onNewMessage?: (message: Message) => void;
}

export function ChatWidget({ agentId, conversationId, onNewMessage }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Call Dify API via our proxy
      const response = await fetch('/api/dify/v1/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: {},
          query: input,
          response_mode: 'streaming',
          conversation_id: conversationId || '',
          user: 'sigmacode-user',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.answer) {
                  assistantMessage += data.answer;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId ? { ...msg, content: assistantMessage } : msg,
                    ),
                  );
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      if (onNewMessage) {
        onNewMessage({
          id: assistantMessageId,
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">Powered by SIGMACODE</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Starten Sie eine Konversation</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/10'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Bot className="h-4 w-4 text-secondary" />
                )}
              </div>
              <div
                className={`rounded-xl p-4 ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-muted rounded-xl p-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Tippt...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Fehler</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht eingeben... (Enter zum Senden)"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
