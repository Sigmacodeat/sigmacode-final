import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  userInfo?: {
    name?: string;
    email?: string;
    company?: string;
    useCase?: string;
  };
  metadata: {
    startedAt: string;
    lastActivity: string;
    source: string;
    userAgent?: string;
  };
}

const chatSessions = new Map<string, ChatSession>();

// Enhanced conversation flow
const conversationFlows = {
  initial: {
    greeting:
      "Hello! I'm your AI assistant for SIGMACODE AI. I can help you discover how our platform can transform your business operations.",
    capabilities: [
      '🔥 **What I Can Help You With:**',
      '',
      '1. **Product Information** - Learn about our features and capabilities',
      '2. **Pricing Details** - Find the right plan for your needs',
      '3. **Demo Scheduling** - Book a personalized demonstration',
      '4. **Technical Questions** - Get answers about our architecture',
      '5. **Support** - Connect with our technical team',
      '',
      'What would you like to explore first?',
    ],
  },
  features: {
    overview: `🔥 **SIGMACODE AI - Key Features:**

• **Multi-Agent Orchestration** - Intelligent coordination between AI agents
• **AI Firewall Protection** - Sub-50ms real-time security filtering
• **Real-time Monitoring** - Live dashboards and analytics
• **Enterprise Security** - SOC 2 Type II certified
• **Easy Integration** - RESTful APIs and webhooks

Our platform combines cutting-edge AI technology with enterprise-grade security.`,
    technical: `⚙️ **Technical Specifications:**

**Performance:**
• Sub-100ms global response times
• 99.9% uptime SLA
• Auto-scaling architecture
• Edge computing deployment

**Security:**
• Zero-trust architecture
• Military-grade encryption
• SOC 2 Type II certified
• GDPR compliant

**Architecture:**
• Multi-agent orchestration
• Real-time processing
• Immutable audit trails
• Advanced analytics

What aspect interests you most?`,
    pricing: `💰 **Pricing Information:**

**Starter Plan - $99/month:**
• Up to 5 AI agents
• Basic firewall protection
• Email support
• 1GB storage

**Professional Plan - $299/month:**
• Up to 25 AI agents
• Advanced security features
• Priority support
• 10GB storage

**Enterprise Plan - Custom:**
• Unlimited agents
• White-label options
• 24/7 support
• Custom integrations

All plans include 14-day free trial, no credit card required.`,
  },
  demo: {
    scheduling: `🎯 **Book Your Personal Demo**

I'd be happy to schedule a personalized demonstration of SIGMACODE AI.

**What would you like to focus on?**
• AI agent setup and configuration
• Security features demonstration
• Integration with your existing tools
• ROI and cost savings analysis

Please provide your details and I'll arrange a demo at your convenience.`,
    confirmation: `✅ **Demo Scheduled Successfully!**

Thank you for your interest in SIGMACODE AI. Our team will contact you shortly to confirm your demo session.

**What happens next:**
• You'll receive a confirmation email
• Our technical team will prepare a personalized demo
• We'll show you exactly how SIGMACODE AI can benefit your business
• No commitment required - just see it in action!

In the meantime, would you like to explore our features or pricing?`,
  },
  leadQualification: {
    questions: [
      'To better help you, could you tell me:',
      '',
      "1. What's your role in your organization?",
      '2. What challenges are you looking to solve with AI?',
      '3. How many team members would use the platform?',
      "4. What's your timeline for implementation?",
      '',
      'This helps me provide the most relevant information for your situation.',
    ],
    followUp:
      "Thank you for sharing that information! Based on what you've told me, I think SIGMACODE AI would be a great fit for your needs.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json().catch(() => ({}));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const { message, sessionId, userInfo, conversationStep } = raw as {
      message?: string;
      sessionId?: string;
      userInfo?: ChatSession['userInfo'];
      conversationStep?: string;
    };

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Message and sessionId are required' }, { status: 400 });
    }

    // Get or create chat session
    let session = chatSessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        messages: [],
        userInfo: userInfo || {},
        metadata: {
          startedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          source: 'chatbot',
          userAgent: req.headers.get('user-agent') || undefined,
        },
      };
      chatSessions.set(sessionId, session);
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Analyze user input and generate response
    const response = await generateResponse(message, session, conversationStep);

    // Add bot response to session
    session.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
    });

    // Update session metadata
    session.metadata.lastActivity = new Date().toISOString();

    // Save session
    chatSessions.set(sessionId, session);

    return NextResponse.json({
      message: response.content,
      metadata: response.metadata,
      sessionId,
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateResponse(
  userMessage: string,
  session: ChatSession,
  conversationStep?: string,
) {
  const message = userMessage.toLowerCase();

  // Simple keyword-based routing with enhanced logic
  if (
    message.includes('hello') ||
    message.includes('hi') ||
    message.includes('hey') ||
    message.includes('start')
  ) {
    return {
      content: conversationFlows.initial.capabilities.join('\n'),
      metadata: { type: 'greeting', action: 'show_capabilities' },
    };
  }

  if (
    message.includes('demo') ||
    message.includes('show') ||
    message.includes('see') ||
    message.includes('trial')
  ) {
    return {
      content: conversationFlows.demo.scheduling,
      metadata: { type: 'demo', action: 'request_demo_info' },
    };
  }

  if (
    message.includes('price') ||
    message.includes('cost') ||
    message.includes('pricing') ||
    message.includes('plan') ||
    message.includes('payment')
  ) {
    return {
      content: conversationFlows.features.pricing,
      metadata: { type: 'pricing', action: 'show_pricing' },
    };
  }

  if (
    message.includes('feature') ||
    message.includes('what') ||
    message.includes('how') ||
    message.includes('does') ||
    message.includes('can')
  ) {
    const rand = Math.random();
    if (rand > 0.5) {
      return {
        content: conversationFlows.features.overview,
        metadata: { type: 'features', action: 'show_overview' },
      };
    } else {
      return {
        content: conversationFlows.features.technical,
        metadata: { type: 'features', action: 'show_technical' },
      };
    }
  }

  if (
    message.includes('contact') ||
    message.includes('talk') ||
    message.includes('speak') ||
    message.includes('call') ||
    message.includes('email')
  ) {
    return {
      content:
        "📞 **Contact Information**\n\n• **Email**: hello@sigmacode.ai\n• **Phone**: +49 30 12345678\n• **Schedule a Call**: https://calendly.com/sigmacode/demo\n\nWhat's the best way to reach you?",
      metadata: { type: 'contact', action: 'provide_contact_info' },
    };
  }

  if (message.includes('security') || message.includes('safe') || message.includes('protect')) {
    return {
      content: `🛡️ **Security & Compliance**

SIGMACODE AI is built with security-first architecture:

**Security Features:**
• Zero-trust architecture
• Military-grade encryption (256-bit)
• SOC 2 Type II certified
• GDPR compliant
• AI Firewall protection
• Immutable audit trails

**Enterprise Standards:**
• ISO 27001 certified
• Regular security audits
• 24/7 monitoring
• Incident response team

Your data is protected with the highest security standards in the industry.`,
      metadata: { type: 'security', action: 'explain_security' },
    };
  }

  if (message.includes('integration') || message.includes('api') || message.includes('connect')) {
    return {
      content: `🔧 **Integration Options**

SIGMACODE AI offers flexible integration methods:

**API Integration:**
• RESTful APIs
• Webhook support
• OAuth 2.0 authentication
• Rate limiting controls
• Real-time data sync

**Pre-built Integrations:**
• Zapier and Make.com
• Slack and Discord
• CRM systems (Salesforce, HubSpot)
• Database connectors
• Cloud storage (AWS S3, Google Cloud)

**Custom Integration:**
• SDK for popular languages
• Webhook templates
• Custom connector development
• On-premise deployment options

Would you like to see our API documentation?`,
      metadata: { type: 'integration', action: 'explain_integration' },
    };
  }

  // Lead qualification responses
  if (
    conversationStep === 'qualification' ||
    message.includes('my role') ||
    message.includes('challenges') ||
    message.includes('team')
  ) {
    return {
      content: conversationFlows.leadQualification.questions.join('\n'),
      metadata: { type: 'qualification', action: 'ask_questions' },
    };
  }

  // Default fallback with helpful options
  return {
    content: `I understand you're interested in learning more about SIGMACODE AI! Let me help you get the right information.

**Quick Options:**
• 🏠 **Overview** - What is SIGMACODE AI?
• ⚡ **Features** - What can it do?
• 💰 **Pricing** - How much does it cost?
• 📅 **Demo** - See it in action
• 📞 **Contact** - Speak to our team
• 🛡️ **Security** - How secure is it?
• 🔧 **Integration** - How does it connect?

Which topic interests you most?`,
    metadata: { type: 'fallback', action: 'provide_options' },
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'SessionId is required' }, { status: 400 });
  }

  const session = chatSessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    session: {
      id: session.id,
      messages: session.messages,
      userInfo: session.userInfo,
      metadata: session.metadata,
    },
  });
}
