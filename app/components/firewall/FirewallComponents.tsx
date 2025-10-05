'use client';

import React from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { GlassCard } from '@/components/ui';
import {
  Shield,
  Filter,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  FileText,
  Users,
  Database,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  Clock,
  TrendingUp,
  BarChart3,
  Layers,
  GitBranch,
} from 'lucide-react';

export function FirewallHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[bottom_1px_center] dark:border-slate-100/5 dark:bg-bottom" />
      <div className="absolute inset-0 flex items-center justify-center dark:bg-slate-900 bg-white [mask-image:linear-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
              <Shield className="h-4 w-4" />
              Agent Firewall Protection
            </div>
          </Reveal>

          <Reveal>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              <span className="block">AI Agent</span>
              <span className="block bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Security Firewall
              </span>
            </h1>
          </Reveal>

          <Reveal>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Vor‑/Nachfilter für Eingaben und Ausgaben: PII‑Redaction, Prompt‑Injection‑Schutz,
              Policy‑Checks, Rate‑Limits und revisionssichere Audit‑Logs – mit{' '}
              <strong className="text-violet-600">Shadow</strong> und{' '}
              <strong className="text-purple-600">Enforce</strong> Modi.
            </p>
          </Reveal>

          {/* Visual Firewall Diagram */}
          <Reveal>
            <div className="relative mb-16">
              <GlassCard className="p-8 bg-gradient-to-br from-white/90 to-white/50 dark:from-slate-800/90 dark:to-slate-700/50">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  {/* Input Flow */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Input</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                      User Request
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:block">
                    <ArrowRight className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="md:hidden">
                    <ChevronDown className="h-6 w-6 text-slate-400" />
                  </div>

                  {/* Firewall Processing */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <Shield className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Firewall</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                      Pre/Post Processing
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:block">
                    <ArrowRight className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="md:hidden">
                    <ChevronDown className="h-6 w-6 text-slate-400" />
                  </div>

                  {/* AI Agent */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Agent</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                      Safe Processing
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:block">
                    <ArrowRight className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="md:hidden">
                    <ChevronDown className="h-6 w-6 text-slate-400" />
                  </div>

                  {/* Output */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Output</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                      Safe Response
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, value: '99.9%', label: 'Threat Detection' },
                { icon: Clock, value: '< 100ms', label: 'Processing Time' },
                { icon: Activity, value: '24/7', label: 'Monitoring' },
                { icon: BarChart3, value: '100%', label: 'Compliance' },
              ].map((stat, index) => (
                <GlassCard key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</div>
                </GlassCard>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FirewallFeatures() {
  const features = [
    {
      icon: Filter,
      title: 'Pre-Filter',
      description: 'PII/Toxicity detection, Prompt Guards, Policy Checks before model execution',
      color: 'from-blue-500 to-cyan-600',
      items: ['PII Detection', 'Toxicity Filter', 'Prompt Injection Protection', 'Rate Limiting'],
    },
    {
      icon: Eye,
      title: 'Post-Filter',
      description:
        'Compliance checks, Hallucination detection, automatic redaction after processing',
      color: 'from-green-500 to-emerald-600',
      items: [
        'Compliance Validation',
        'Hallucination Detection',
        'Data Redaction',
        'Output Sanitization',
      ],
    },
    {
      icon: GitBranch,
      title: 'Dual Mode',
      description: 'Shadow mode for testing, Enforce mode for production protection',
      color: 'from-orange-500 to-red-600',
      items: ['Shadow Testing', 'Enforce Blocking', 'Risk Assessment', 'Gradual Rollout'],
    },
  ];

  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Multi-Layer Protection System
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Our firewall operates at multiple levels to ensure comprehensive security for your AI
              agents.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Reveal key={index}>
              <GlassCard className="p-8 hover:scale-105 transition-transform duration-300">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FirewallPolicies() {
  const policies = [
    {
      icon: Lock,
      title: 'PII Redaction',
      description:
        'Automatically detects and redacts personal identifiable information in real-time',
      color: 'from-blue-500 to-indigo-600',
      features: ['Email Detection', 'Phone Numbers', 'SSN/Passport', 'Credit Cards'],
    },
    {
      icon: AlertTriangle,
      title: 'Prompt Guards',
      description: 'Blocks instructions that attempt to bypass security rules and policies',
      color: 'from-yellow-500 to-orange-600',
      features: [
        'Injection Prevention',
        'Rule Bypass Detection',
        'Malicious Patterns',
        'Context Analysis',
      ],
    },
    {
      icon: Activity,
      title: 'Rate Limiting',
      description: 'Protects against abuse and ensures fair usage with intelligent throttling',
      color: 'from-green-500 to-teal-600',
      features: ['Request Throttling', 'Cost Control', 'Abuse Prevention', 'Fair Usage'],
    },
    {
      icon: Database,
      title: 'Audit Logging',
      description: 'Comprehensive logging with export capabilities for compliance and forensics',
      color: 'from-purple-500 to-pink-600',
      features: ['Complete Trail', 'Export Functions', 'Compliance Ready', 'Forensic Analysis'],
    },
  ];

  return (
    <section className="py-20 px-6 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Advanced Security Policies
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Our firewall implements multiple layers of security policies to protect your AI
              agents.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8">
          {policies.map((policy, index) => (
            <Reveal key={index}>
              <GlassCard className="p-8">
                <div className="flex items-start gap-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${policy.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <policy.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {policy.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">{policy.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {policy.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FirewallAudit() {
  const auditFeatures = [
    {
      icon: FileText,
      title: 'Comprehensive Logging',
      description: 'Every input, output, and decision is logged with full context and metadata',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Live monitoring and analytics of firewall performance and threat detection',
    },
    {
      icon: Settings,
      title: 'Export & Compliance',
      description: 'Export logs in multiple formats for compliance requirements and analysis',
    },
    {
      icon: Layers,
      title: 'Forensic Analysis',
      description: 'Deep dive capabilities for security investigations and incident response',
    },
  ];

  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Audit & Monitoring
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Complete visibility and control with comprehensive audit trails and monitoring
              capabilities.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {auditFeatures.map((feature, index) => (
            <Reveal key={index}>
              <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FirewallFAQ() {
  const faqs = [
    {
      question: 'How do I activate the firewall?',
      answer:
        'Simply enable it via feature flags for each agent or workflow. No complex setup required.',
    },
    {
      question: 'Can I write custom security rules?',
      answer:
        'Yes, our policy engine is fully configurable and extensible to meet your specific requirements.',
    },
    {
      question: 'What happens in Shadow mode?',
      answer:
        'Shadow mode allows you to test firewall rules without blocking legitimate traffic, perfect for gradual rollout.',
    },
    {
      question: 'How fast is the processing?',
      answer:
        'Our firewall processes requests in under 100ms, ensuring no impact on your AI agent performance.',
    },
  ];

  return (
    <section className="py-20 px-6 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Everything you need to know about our AI Agent Firewall.
            </p>
          </div>
        </Reveal>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Reveal key={index}>
              <GlassCard className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="text-center mt-12">
            <GlassCard className="p-8 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Secure Your AI Agents?</h3>
              <p className="text-violet-100 mb-6">
                Start protecting your AI workflows with enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-violet-600 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                  Get Started Free
                </button>
                <button className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </GlassCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
