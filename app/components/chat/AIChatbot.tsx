'use client';

import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Shield,
  BarChart3,
  Target,
  Users,
  CreditCard,
  BookOpen,
  Settings,
  Globe,
  Award,
  TrendingUp,
  HeadphonesIcon,
  FileText,
  Video,
} from 'lucide-react';
import { useNotification } from '@/components/notifications/NotificationSystem';
import { getAnalytics, analyticsUtils } from '@/app/lib/analytics';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    type?:
      | 'greeting'
      | 'feature'
      | 'pricing'
      | 'demo'
      | 'contact'
      | 'security'
      | 'integration'
      | 'analytics';
    action?: string;
    confidence?: number;
    sources?: string[];
    engine?: string;
    timestamp?: number;
  };
}

interface ChatbotProps {
  onDemoRequest?: (data: { name: string; email: string; company: string; useCase: string }) => void;
  onContactRequest?: (data: { name: string; email: string; message: string }) => void;
}

export function AIChatbot({ onDemoRequest, onContactRequest }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [lastCompletedAt, setLastCompletedAt] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    company: '',
    useCase: '',
  });
  const [conversationStep, setConversationStep] = useState<
    | 'greeting'
    | 'info'
    | 'qualification'
    | 'demo'
    | 'contact'
    | 'pricing'
    | 'security'
    | 'integration'
  >('greeting');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortCtrlRef = useRef<AbortController | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const recognitionRef = useRef<any>(null);
  const scrollRafId = useRef<number | null>(null);

  const notification = useNotification();
  // Refs used for scrolling and session tracking
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  );

  // track scroll position to show scroll-to-bottom affordance
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (scrollRafId.current) cancelAnimationFrame(scrollRafId.current);
    scrollRafId.current = requestAnimationFrame(() => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
      setAtBottom(nearBottom);
    });
  };

  const getPositionClasses = () => {
    return 'fixed bottom-6 right-6 z-50';
  };

  const getSizeClasses = () => {
    return 'w-96 h-[600px]';
  };

  const scrollToBottom = () => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return;
      }
      const el = messagesContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch {}
  };

  const companyName = 'SIGMACODE';
  const primaryColor = '#3b82f6';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Voice Input (Web Speech API) ---
  const startListening = () => {
    try {
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) {
        notification.error?.(
          'Spracherkennung nicht verfügbar',
          'Ihr Browser unterstützt diese Funktion nicht.',
        );
        return;
      }
      const recognition = new SR();
      recognition.lang = 'de-DE';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue((prev) => transcript || prev);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (e: any) {
      setIsListening(false);
      notification.error?.('Fehler bei Spracherkennung', e?.message || 'Unbekannter Fehler');
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop?.();
    } finally {
      setIsListening(false);
    }
  };

  // Local storage persistence per session
  useEffect(() => {
    try {
      const key = `chat_session_${sessionIdRef.current}`;
      if (messages.length === 0) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as Message[];
          if (Array.isArray(parsed))
            setMessages(parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const key = `chat_session_${sessionIdRef.current}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    // Smart auto-start: Nach 30 Sekunden oder wenn User scrollt/clickt
    const startTimer = setTimeout(() => {
      if (!hasStarted && messages.length === 0) {
        handleSmartStart();
      }
    }, 30000);

    // Track user engagement
    const trackEngagement = () => {
      if (!hasStarted) {
        handleSmartStart();
      }
    };

    const handleScroll = () => trackEngagement();
    const handleClick = () => trackEngagement();

    window.addEventListener('scroll', handleScroll, { once: true });
    window.addEventListener('click', handleClick, { once: true });

    return () => {
      clearTimeout(startTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
    };
  }, [hasStarted, messages.length]);

  const handleSmartStart = () => {
    setHasStarted(true);
    setConversationStep('greeting');
    addBotMessage(
      `🔥 **Willkommen bei ${companyName}!**

Ich bin Ihr persönlicher AI-Sales-Assistent - powered by unserer Neural Firewall für maximale Sicherheit.

**Wie kann ich Ihnen helfen?**
• 🚀 **Produkt-Demo** buchen
• 💰 **Preise & Pläne** erfahren
• 🛡️ **Sicherheits-Features** entdecken
• 🔧 **Integration** besprechen
• 📊 **Analytics & Monitoring** verstehen

Was ist Ihr Hauptinteresse?`,
      { type: 'greeting', confidence: 0.95, engine: 'SIGMACODE AI' },
    );
  };

  const addBotMessage = (content: string, metadata?: any) => {
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(
      () => {
        const message: Message = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'bot',
          content,
          timestamp: new Date(),
          metadata,
        };
        setMessages((prev) => [...prev, message]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1500,
    );
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    addUserMessage(messageContent);
    setInputValue('');

    try {
      setIsTyping(true);
      setIsStreaming(true);
      // Placeholder Bot Message for live streaming
      const botId = Math.random().toString(36).substr(2, 9);
      setMessages((prev) => [
        ...prev,
        { id: botId, type: 'bot', content: '', timestamp: new Date() },
      ]);

      const abortCtrl = new AbortController();
      abortCtrlRef.current = abortCtrl;
      const response = await fetch('/api/sigmacode-ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          messages: [
            ...messages,
            {
              id: 'temp',
              type: 'user',
              content: messageContent,
              timestamp: new Date(),
            },
          ].map((m) => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content,
            metadata: (m as Message).metadata || {},
          })),
          userProfile: userInfo,
          conversationStep,
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
        const chunk = decoder.decode(value || new Uint8Array(), {
          stream: !done,
        });
        remainder += chunk;
        let idx;
        while ((idx = remainder.indexOf('\n\n')) !== -1) {
          const line = remainder.slice(0, idx).trim();
          remainder = remainder.slice(idx + 2);
          if (!line) continue;
          // Expect SSE format: lines start with "data: "
          const dataPrefix = 'data:';
          const payloadStr = line.startsWith(dataPrefix)
            ? line.slice(dataPrefix.length).trim()
            : line;
          if (payloadStr === '[DONE]') continue;
          try {
            const payload = JSON.parse(payloadStr);
            const delta: string =
              payload?.answer || payload?.output_text || payload?.data || payload?.text || '';
            if (delta) {
              setMessages((prev) =>
                prev.map((m) => (m.id === botId ? { ...m, content: m.content + delta } : m)),
              );
            }
          } catch {
            // Fallback: treat as plain text token
            setMessages((prev) =>
              prev.map((m) => (m.id === botId ? { ...m, content: m.content + payloadStr } : m)),
            );
          }
        }
      }
      setIsTyping(false);
      setIsStreaming(false);
      abortCtrlRef.current = null;
      setLastCompletedAt(Date.now());
      getAnalytics().trackEvent({
        name: 'chatbot_message_completed',
        category: 'chat',
        action: 'completed',
        label: sessionIdRef.current,
        customData: { conversationStep },
      });
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        // user cancelled
        setIsTyping(false);
        setIsStreaming(false);
        abortCtrlRef.current = null;
        getAnalytics().trackEvent({
          name: 'chatbot_generation_aborted',
          category: 'chat',
          action: 'aborted',
          label: sessionIdRef.current,
          customData: { conversationStep },
        });
        return;
      }
      notification.error?.('Chat-Fehler', e?.message || 'Fehler bei der Chat-Anfrage');
      setIsTyping(false);
      setIsStreaming(false);
      abortCtrlRef.current = null;
    }
  };

  const stopGenerating = () => {
    try {
      abortCtrlRef.current?.abort();
    } catch {}
  };

  const retryLast = () => {
    // find the last user message and resend
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        handleSendMessage(messages[i].content);
        break;
      }
    }
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActions(false);

    switch (action) {
      case 'demo':
        setConversationStep('demo');
        addBotMessage(
          `🎯 **Demo-Termin vereinbaren**

Perfekt! Ich helfe Ihnen dabei, eine persönliche Demo zu buchen.

**Unsere Demo umfasst:**
✅ Live-Vorführung unserer AI-Firewall
✅ Architektur-Übersicht & Integration
✅ Kostenlose Sicherheitsbewertung
✅ Individuelle Beratung

**Ihre Kontaktdaten:**
Name: ${userInfo.name || 'Nicht angegeben'}
Email: ${userInfo.email || 'Nicht angegeben'}
Firma: ${userInfo.company || 'Nicht angegeben'}

Möchten Sie diese Daten bestätigen oder ändern?`,
          { type: 'demo', action: 'demo_request', engine: 'SIGMACODE AI' },
        );
        break;

      case 'pricing':
        setConversationStep('pricing');
        addBotMessage(
          `💰 **${companyName} Preise & Pläne**

**Starter Plan - €99/Monat:**
• Bis zu 5 AI-Agents
• Basis-Firewall-Schutz
• E-Mail Support
• 1GB Storage

**Professional Plan - €299/Monat:**
• Bis zu 25 AI-Agents
• Erweiterte Sicherheitsfeatures
• Priority Support
• 10GB Storage

**Enterprise Plan - Individuell:**
• Unbegrenzte Agents
• White-Label Optionen
• 24/7 Support
• Individuelle Integrationen

**Alle Pläne beinhalten:**
✅ 14 Tage kostenlose Testphase
✅ Keine Kreditkarte erforderlich
✅ Monatliche Kündigung möglich

Welcher Plan passt am besten zu Ihren Anforderungen?`,
          { type: 'pricing', action: 'pricing_info', engine: 'SIGMACODE AI' },
        );
        break;

      case 'security':
        setConversationStep('security');
        addBotMessage(
          `🛡️ **${companyName} Sicherheit**

Unsere Neural Firewall bietet branchenführende Sicherheit:

**Sicherheits-Features:**
🔐 **Zero-Trust Architektur**
🛡️ **AI-Firewall** mit Sub-50ms Schutz
🔒 **256-Bit Verschlüsselung**
📋 **SOC 2 Type II** zertifiziert
🌍 **GDPR konform**
📊 **Immutable Audit Trails**

**Enterprise-Standards:**
• ISO 27001 Zertifizierung
• Regelmäßige Sicherheitsaudits
• 24/7 Monitoring
• Incident Response Team

**AI-Sicherheit speziell:**
• Echtzeit-Content-Filtering
• Prompt-Injection-Schutz
• Malicious Code Detection
• Secure Agent Isolation

Ihre Daten sind bei ${companyName} maximal geschützt!`,
          { type: 'security', action: 'security_info', engine: 'SIGMACODE AI' },
        );
        break;

      case 'integration':
        setConversationStep('integration');
        addBotMessage(
          `🔧 **Integration & Architektur**

${companyName} integriert sich nahtlos in Ihre Infrastruktur:

**Integration-Optionen:**
• RESTful APIs
• Webhook Events
• SDKs (Python, Node.js, Java)
• Docker Container
• Kubernetes Deployment
• Cloud Provider Integration

**Typische Integrationen:**
• ChatGPT, Claude, DALL-E
• Slack, Discord, Teams
• CRM Systeme (Salesforce, HubSpot)
• Monitoring Tools (Grafana, Datadog)
• SIEM Systeme

**Deployment:**
• On-Premise
• Private Cloud
• Public Cloud (AWS, Azure, GCP)
• Hybrid Lösungen

Wie sieht Ihre aktuelle Infrastruktur aus?`,
          { type: 'integration', action: 'integration_info', engine: 'SIGMACODE AI' },
        );
        break;

      case 'features':
        handleSendMessage('Erzählen Sie mir von Ihren Features');
        break;

      case 'contact':
        handleSendMessage('Ich möchte mit Ihrem Team sprechen');
        break;

      default:
        handleSendMessage(action);
    }
  };

  const renderQuickActions = () => {
    if (!showQuickActions || messages.length > 0) return null;

    const actions = [
      {
        key: 'demo',
        label: 'Demo buchen',
        description: 'Persönliche Vorführung',
        color: 'bg-blue-500 hover:bg-blue-600',
        icon: '📅',
      },
      {
        key: 'pricing',
        label: 'Preise',
        description: 'Pläne & Kosten',
        color: 'bg-green-500 hover:bg-green-600',
        icon: '💰',
      },
      {
        key: 'security',
        label: 'Sicherheit',
        description: 'Firewall & Compliance',
        color: 'bg-purple-500 hover:bg-purple-600',
        icon: '🛡️',
      },
      {
        key: 'integration',
        label: 'Integration',
        description: 'APIs & Deployment',
        color: 'bg-orange-500 hover:bg-orange-600',
        icon: '🔧',
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => handleQuickAction(action.key)}
            className={`p-3 rounded-lg text-white ${action.color} transition-all duration-200 hover:scale-105 flex flex-col items-center gap-1 text-sm`}
          >
            <span className="text-lg">{action.icon}</span>
            <span className="font-medium">{action.label}</span>
            <span className="text-xs opacity-90">{action.description}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={getPositionClasses()}>
      {/* Chat Button with enhanced design */}
      {!isOpen && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative w-16 h-16 bg-brand-gradient rounded-full shadow-brand-glow hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
          >
            <MessageCircle className="h-7 w-7 text-white" />

            {/* Enhanced notification badge */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs font-bold text-white">AI</span>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-brand opacity-20 blur-lg group-hover:blur-xl transition-all duration-300" />
          </button>

          {/* Smart tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {companyName} AI Assistant
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}

      {/* Enhanced Chat Window */}
      {isOpen && (
        <GlassCard
          className={`${getSizeClasses()} flex flex-col chat-accent animate-in slide-in-from-bottom-4 duration-300`}
        >
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-brand/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{companyName} AI</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-brand-500">Online</span>
                  {isTyping && <LoadingSpinner size="sm" color="text-brand-500" />}
                  {!isTyping && lastCompletedAt && (
                    <span className="text-xs text-brand-500/80">Fertig</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Minimize button */}
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Quick Actions"
              >
                <Target className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages with enhanced styling */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {messages.length === 0 && !hasStarted && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Willkommen bei {companyName}!
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  Ich helfe Ihnen dabei, Ihre AI-Sicherheit zu revolutionieren.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleQuickAction('demo')}
                    className="px-4 py-2 bg-brand text-white rounded-lg hover:brightness-110 transition-colors text-sm"
                  >
                    Demo buchen
                  </button>
                  <button
                    onClick={() => handleQuickAction('security')}
                    className="px-4 py-2 border border-brand text-brand rounded-lg hover:bg-brand hover:text-white transition-colors text-sm"
                  >
                    Sicherheit
                  </button>
                </div>
              </div>
            )}

            {(focusMode && messages.length > 6 ? messages.slice(-6) : messages).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    message.type === 'user'
                      ? 'bg-brand text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-4 w-4 text-brand-500" />
                      <span className="text-xs font-medium text-brand-600">{companyName} AI</span>
                      {message.metadata?.confidence && (
                        <span className="text-xs text-brand-500/60">
                          {Math.round(message.metadata.confidence * 100)}% confidence
                        </span>
                      )}
                      {message.metadata?.engine && (
                        <span className="text-xs text-brand-500/40">
                          via {message.metadata.engine}
                        </span>
                      )}
                    </div>
                  )}

                  {message.type === 'user' && (
                    <div className="flex items-center gap-2 mb-3 justify-end">
                      <span className="text-xs font-medium text-brand-500/80">Sie</span>
                      <User className="h-4 w-4 text-brand-500/80" />
                    </div>
                  )}

                  <div className="text-sm leading-relaxed prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  <div className="text-xs mt-3 opacity-70 flex items-center justify-between">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.metadata?.sources && (
                      <span className="text-brand-500">
                        {message.metadata.sources.length} Quelle(n)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Bot className="h-4 w-4 text-brand-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Denkt nach...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Quick Actions */}
          {renderQuickActions()}

          {/* Enhanced Input with better UX */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {focusMode ? 'Focus aus' : 'Focus an'}
                </button>
                {isStreaming ? (
                  <button
                    onClick={stopGenerating}
                    className="px-2 py-1 border border-red-400 text-red-600 rounded-md hover:bg-red-50"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={retryLast}
                    className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Wiederholen
                  </button>
                )}
              </div>
              {!atBottom && (
                <button
                  onClick={scrollToBottom}
                  className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Nach unten
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Beschreiben Sie Ihre Anforderungen..."
                  disabled={isTyping}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed pr-12"
                />
                {inputValue && (
                  <button
                    onClick={() => setInputValue('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {/* Voice input button */}
              <button
                onClick={() => (isListening ? stopListening() : startListening())}
                className={`p-3 rounded-xl border ${isListening ? 'border-red-400 text-red-600' : 'border-slate-300 dark:border-slate-600 text-slate-600'} hover:bg-slate-100 dark:hover:bg-slate-700`}
                title={isListening ? 'Aufnahme beenden' : 'Sprachaufnahme starten'}
              >
                {/* Simple mic icon using SVG to avoid extra deps */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2z" />
                  <path d="M13 19.95V22h-2v-2.05A8.001 8.001 0 0 1 4.05 13H6a6 6 0 1 0 12 0h1.95A8.001 8.001 0 0 1 13 19.95z" />
                </svg>
              </button>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="p-3 bg-brand text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
              <span>Drücken Sie Enter zum Senden • Shift+Enter für neue Zeile</span>
              <span>{inputValue.length}/500</span>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
