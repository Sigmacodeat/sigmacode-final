'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  Shield,
  Brain,
  Zap,
  Lock,
  Eye,
  Database,
  Network,
  Cpu,
  Globe,
  Bot,
  Sparkles,
  Infinity as InfinityIcon,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
} from 'lucide-react';

interface AgentCard {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'warning' | 'success';
  metrics: {
    requests: string;
    latency: string;
    accuracy: string;
  };
  features: string[];
}

const agents: AgentCard[] = [
  {
    id: 'firewall',
    name: 'Neural Firewall Agent',
    description: 'Intelligente Vor-/Nachfilter mit <100ms Latenz',
    icon: Shield,
    status: 'active',
    metrics: {
      requests: '99.9%',
      latency: '<50ms',
      accuracy: '99.9%',
    },
    features: ['PII Detection', 'Prompt Guards', 'Policy Enforcement'],
  },
  {
    id: 'analyzer',
    name: 'Content Analyzer',
    description: 'Deep Content Analysis & Compliance Checks',
    icon: Brain,
    status: 'success',
    metrics: {
      requests: '98.7%',
      latency: '<30ms',
      accuracy: '99.5%',
    },
    features: ['Content Classification', 'Compliance Check', 'Risk Assessment'],
  },
  {
    id: 'monitor',
    name: 'Audit Monitor',
    description: 'Revisionssichere Logging & Monitoring',
    icon: Eye,
    status: 'active',
    metrics: {
      requests: '100%',
      latency: '<10ms',
      accuracy: '100%',
    },
    features: ['Real-time Logging', 'Audit Trails', 'Export Functions'],
  },
];

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-500' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500' },
  success: { icon: CheckCircle, color: 'text-blue-500' },
};

export function SuperAgentsAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90 py-20"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 opacity-20"
          variants={floatingVariants}
          animate="animate"
        >
          <Network className="h-16 w-16 text-brand-500" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 opacity-20"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        >
          <Database className="h-12 w-12 text-brand-600" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/4 opacity-20"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
        >
          <Cpu className="h-14 w-14 text-brand-400" />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
            style={{
              background: 'color-mix(in oklab, var(--brand) 10%, transparent)',
              border: `1px solid color-mix(in oklab, var(--brand) 20%, transparent)`,
            }}
            variants={pulseVariants}
            animate="pulse"
          >
            <Bot className="h-4 w-4" style={{ color: 'var(--brand-600)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--brand-600)' }}>
              SIGMACODE Neural Agents
            </span>
          </motion.div>

          <h2
            className="text-4xl font-bold tracking-tight md:text-5xl mb-6"
            style={{ color: 'var(--fg)' }}
          >
            Firewall-Powered{' '}
            <span className="relative">
              <span className="relative z-10">AI Agents</span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-3"
                style={{
                  background: 'var(--brand-gradient)',
                  originX: 0,
                }}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </span>
          </h2>

          <p className="mx-auto max-w-3xl text-lg" style={{ color: 'var(--muted-foreground)' }}>
            Intelligente Agenten mit integrierter Firewall-Architektur für maximale Sicherheit bei
            minimaler Latenz. Jeder Request wird durch unsere Neural Firewall geleitet.
          </p>
        </motion.div>

        {/* Agents Grid */}
        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {agents.map((agent, index) => {
            const StatusIcon = statusConfig[agent.status].icon;
            const statusColor = statusConfig[agent.status].color;

            return (
              <motion.div
                key={agent.id}
                className="group relative"
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredAgent(agent.id)}
                onHoverEnd={() => setHoveredAgent(null)}
              >
                {/* Card Background with Glass Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: 'color-mix(in oklab, var(--brand) 5%, transparent)',
                    border: `1px solid color-mix(in oklab, var(--brand) 15%, transparent)`,
                  }}
                  layoutId={`card-bg-${agent.id}`}
                />

                <motion.div
                  className="relative rounded-2xl border p-8 transition-all duration-300"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--card)',
                  }}
                  whileHover={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between">
                      <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
                        <motion.div
                          className="rounded-xl p-3"
                          style={{
                            background: 'color-mix(in oklab, var(--brand) 10%, transparent)',
                          }}
                          animate={hoveredAgent === agent.id ? { rotate: 360 } : {}}
                          transition={{ duration: 0.6 }}
                        >
                          <agent.icon className="h-6 w-6" style={{ color: 'var(--brand-600)' }} />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
                            {agent.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {agent.status === 'active'
                                ? 'Online'
                                : agent.status === 'success'
                                  ? 'Optimized'
                                  : 'Monitoring'}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: 'color-mix(in oklab, var(--brand) 10%, transparent)',
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <ArrowRight className="h-4 w-4" style={{ color: 'var(--brand-600)' }} />
                      </motion.div>
                    </div>

                    <p className="mt-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {agent.description}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="mb-6 grid grid-cols-3 gap-4">
                    {Object.entries(agent.metrics).map(([key, value]) => (
                      <motion.div key={key} className="text-center" whileHover={{ scale: 1.05 }}>
                        <div className="text-lg font-bold" style={{ color: 'var(--brand-600)' }}>
                          {value}
                        </div>
                        <div
                          className="text-xs uppercase tracking-wide"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {key === 'requests'
                            ? 'Uptime'
                            : key === 'latency'
                              ? 'Latency'
                              : 'Accuracy'}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {agent.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 0.8 + index * 0.1 + featureIndex * 0.1 }}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: 'var(--brand-600)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Animated Elements */}
                  {hoveredAgent === agent.id && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Sparkle Effects */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            top: `${20 + i * 15}%`,
                            left: `${10 + i * 15}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        >
                          <Sparkles className="h-3 w-3" style={{ color: 'var(--brand-400)' }} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-6 py-3"
            style={{
              background: 'var(--brand-gradient)',
              color: 'var(--brand-foreground)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <InfinityIcon className="h-4 w-4" />
            <span className="font-medium">Alle Agents erkunden</span>
            <ArrowRight className="h-4 w-4" />
          </motion.div>

          <p className="mt-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Shadow-Mode für risikofreies Testen • Enforce-Mode für Policy-Durchsetzung
          </p>
        </motion.div>
      </div>
    </section>
  );
}
