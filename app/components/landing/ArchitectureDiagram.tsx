'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Server, Database, Shield, Cpu, Cloud, ArrowRight, Zap, Lock, Eye } from 'lucide-react';

interface ArchitectureNode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  x: number;
  y: number;
  category: 'input' | 'processing' | 'security' | 'storage' | 'output';
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  type: 'data' | 'security' | 'monitoring';
}

const nodes: ArchitectureNode[] = [
  {
    id: 'client',
    title: 'Client Application',
    description: 'Web/Mobile Frontend',
    icon: Cloud,
    x: 100,
    y: 50,
    category: 'input',
  },
  {
    id: 'kong',
    title: 'Kong Gateway',
    description: 'TLS • Routing • Rate Limits',
    icon: Shield,
    x: 200,
    y: 50,
    category: 'security',
  },
  {
    id: 'firewall',
    title: 'AI Firewall',
    description: 'Request/Response Filtering',
    icon: Shield,
    x: 300,
    y: 50,
    category: 'security',
  },
  {
    id: 'orchestrator',
    title: 'Agent Orchestrator',
    description: 'Intelligent Routing',
    icon: Cpu,
    x: 500,
    y: 50,
    category: 'processing',
  },
  {
    id: 'sigmacodeEngine',
    title: 'SIGMACODE AI Engine',
    description: 'Conversational / Agentic AI',
    icon: Server,
    x: 350,
    y: 150,
    category: 'processing',
  },
  {
    id: 'sigmaguard',
    title: 'SIGMAGUARD (powered by Superagent)',
    description: 'AI Firewall & Workflow Automation',
    icon: Server,
    x: 550,
    y: 150,
    category: 'processing',
  },
  {
    id: 'audit',
    title: 'Audit Log',
    description: 'Immutable Records',
    icon: Database,
    x: 700,
    y: 50,
    category: 'storage',
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    description: 'Real-time Metrics',
    icon: Eye,
    x: 700,
    y: 150,
    category: 'output',
  },
];

const connections: Connection[] = [
  { from: 'client', to: 'kong', type: 'data' },
  { from: 'kong', to: 'firewall', type: 'security', label: 'TLS • Routed' },
  {
    from: 'firewall',
    to: 'orchestrator',
    type: 'data',
    label: 'Filtered Request',
  },
  { from: 'orchestrator', to: 'sigmacodeEngine', type: 'data', label: 'Route to SIGMACODE' },
  {
    from: 'orchestrator',
    to: 'sigmaguard',
    type: 'data',
    label: 'Route to SIGMAGUARD',
  },
  { from: 'sigmacodeEngine', to: 'orchestrator', type: 'data', label: 'Response' },
  { from: 'sigmaguard', to: 'orchestrator', type: 'data', label: 'Response' },
  { from: 'orchestrator', to: 'firewall', type: 'data', label: 'Response' },
  { from: 'firewall', to: 'client', type: 'data', label: 'Final Response' },
  { from: 'firewall', to: 'audit', type: 'monitoring', label: 'Audit Event' },
  {
    from: 'orchestrator',
    to: 'audit',
    type: 'monitoring',
    label: 'Audit Event',
  },
  { from: 'audit', to: 'monitoring', type: 'monitoring', label: 'Metrics' },
];

const categoryColors = {
  input: 'var(--brand)',
  processing: 'var(--brand)',
  security: 'var(--brand)',
  storage: 'var(--brand)',
  output: 'var(--brand)',
};

const connectionTypes = {
  data: { color: '#64748b', width: 2, dash: '0' }, // slate-500
  security: { color: 'var(--brand-end)', width: 3, dash: '5,5' }, // accent (Neon Cyan)
  monitoring: { color: '#94a3b8', width: 2, dash: '10,5' }, // slate-400
};

export function ArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || '#6b7280';
  };

  const getConnectionStyle = (type: string) => {
    const style = connectionTypes[type as keyof typeof connectionTypes];
    return {
      stroke: style.color,
      strokeWidth: style.width,
      strokeDasharray: style.dash,
      fill: 'none',
    };
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{
              border: `1px solid var(--brand-600)`,
              backgroundColor: 'rgba(10,31,68,0.06)',
              color: 'var(--brand-600)',
            }}
          >
            <Server className="h-4 w-4" />
            System Architecture
          </div>
          <h2 className="mt-6 text-4xl font-bold text-slate-900 dark:text-white md:text-5xl">
            Technical
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              Architecture
            </span>
          </h2>
          <p className="mt-6 text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            State-of-the-art infrastructure with multi-layered security, intelligent routing, and
            comprehensive monitoring capabilities.
          </p>
        </div>

        {/* Diagram */}
        <div className="relative">
          <GlassCard className="p-8">
            <svg viewBox="0 0 900 300" className="w-full h-auto" style={{ minHeight: '400px' }}>
              {/* Connections */}
              {connections.map((conn, index) => {
                const fromNode = nodes.find((n) => n.id === conn.from);
                const toNode = nodes.find((n) => n.id === conn.to);

                if (!fromNode || !toNode) return null;

                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                return (
                  <g key={index}>
                    <path
                      d={`M ${fromNode.x + 50} ${fromNode.y + 25}
                          Q ${midX + 50} ${fromNode.y + 25} ${midX + 50} ${midY + 25}
                          Q ${midX + 50} ${toNode.y + 25} ${toNode.x + 50} ${toNode.y + 25}`}
                      {...getConnectionStyle(conn.type)}
                      className="transition-all duration-300"
                      opacity={hoveredNode === conn.from || hoveredNode === conn.to ? 1 : 0.6}
                    />

                    {/* Connection Label */}
                    {conn.label && (
                      <text
                        x={midX + 50}
                        y={midY + 15}
                        className="text-xs font-medium fill-slate-600 dark:fill-slate-300"
                        textAnchor="middle"
                      >
                        {conn.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const IconComponent = node.icon;
                const isSelected = selectedNode === node.id;
                const isHovered = hoveredNode === node.id;

                return (
                  <g key={node.id}>
                    {/* Node Circle */}
                    <circle
                      cx={node.x + 50}
                      cy={node.y + 25}
                      r={isSelected || isHovered ? '30' : '25'}
                      fill={getNodeColor(node.category)}
                      className="transition-all duration-300 cursor-pointer"
                      opacity={isSelected || isHovered ? 1 : 0.8}
                      onClick={() => setSelectedNode(node.id)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    />

                    {/* Node Icon */}
                    <foreignObject x={node.x + 35} y={node.y + 10} width="30" height="30">
                      <div className="flex h-full w-full items-center justify-center">
                        <IconComponent
                          className="h-6 w-6 text-white"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                          }}
                        />
                      </div>
                    </foreignObject>

                    {/* Node Label */}
                    <text
                      x={node.x + 50}
                      y={node.y + 65}
                      className="text-sm font-semibold fill-slate-900 dark:fill-white"
                      textAnchor="middle"
                    >
                      {node.title}
                    </text>

                    <text
                      x={node.x + 50}
                      y={node.y + 80}
                      className="text-xs fill-slate-600 dark:fill-slate-300"
                      textAnchor="middle"
                    >
                      {node.description}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {selectedNode && (
              <div className="absolute top-4 right-4 max-w-sm">
                <GlassCard className="p-4">
                  {(() => {
                    const node = nodes.find((n) => n.id === selectedNode);
                    if (!node) return null;

                    const IconComponent = node.icon;
                    return (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: getNodeColor(node.category) + '20',
                          }}
                        >
                          <IconComponent
                            className="h-5 w-5"
                            style={{ color: getNodeColor(node.category) }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {node.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            {node.description}
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {node.category.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </GlassCard>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Architecture Details */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <GlassCard className="p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Performance</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Sub-100ms response times globally
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Edge computing, CDN, Optimized routing
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Security</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Military-grade protection layers
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              SOC 2, ISO 27001, GDPR compliant
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 mb-4">
              <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Reliability</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              99.9% uptime SLA guarantee
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Redundant systems, Failover, Auto-scaling
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 mb-4">
              <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Monitoring</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Real-time observability
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Metrics, Logs, Traces, Alerts
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
