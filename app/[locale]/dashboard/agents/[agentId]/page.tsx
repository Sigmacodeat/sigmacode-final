/**
 * SIGMACODE AI - Agent Details & Execution Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Shield,
  Play,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  firewallEnabled: boolean;
  firewallPolicy: string;
  modelTier: string | null;
  createdAt: string;
}

interface ExecutionResult {
  success: boolean;
  executionId?: string;
  output?: any;
  error?: string;
  firewall?: {
    enabled: boolean;
    mode: string;
    preCheck: any;
    postCheck: any;
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params?.agentId as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  async function loadAgent() {
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setAgent(data);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  }

  async function executeAgent() {
    setExecuting(true);
    setExecutionResult(null);

    try {
      const res = await fetch(`/api/agents/${agentId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { message: input },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setExecutionResult({
          success: true,
          ...data,
        });
      } else {
        setExecutionResult({
          success: false,
          error: data.error || 'Execution failed',
        });
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setExecuting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent rounded w-1/3" />
          <div className="h-64 bg-accent rounded" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent nicht gefunden</h2>
          <Link href="/dashboard/agents" className="text-blue-600 hover:underline">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/agents"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Übersicht
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
              {agent.description && <p className="text-gray-600 mt-1">{agent.description}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/dashboard/agents/${agentId}/edit`}
              className="p-2 border rounded-lg hover:bg-accent transition-colors"
            >
              <Edit className="h-5 w-5" />
            </Link>
            <button className="p-2 border rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Agent Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Firewall-Status</h3>
          <div className="flex items-center space-x-2">
            {agent.firewallEnabled ? (
              <>
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-600">Aktiv ({agent.firewallPolicy})</span>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="font-semibold text-gray-600">Inaktiv</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Model-Tier</h3>
          <p className="font-semibold text-gray-900">{agent.modelTier || 'Standard'}</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Erstellt am</h3>
          <p className="font-semibold text-gray-900">
            {new Date(agent.createdAt).toLocaleDateString('de-DE')}
          </p>
        </div>
      </div>

      {/* Execution Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agent ausführen</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eingabe</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Geben Sie Ihre Anfrage ein..."
              />
            </div>
            <button
              onClick={executeAgent}
              disabled={executing || !input}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {executing ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Wird ausgeführt...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Ausführen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ergebnis</h2>
          {executionResult ? (
            <div className="space-y-4">
              {/* Status */}
              <div
                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  executionResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {executionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {executionResult.success ? 'Erfolgreich' : 'Fehlgeschlagen'}
                  </p>
                  {executionResult.executionId && (
                    <p className="text-sm text-gray-600 mt-1">ID: {executionResult.executionId}</p>
                  )}
                </div>
              </div>

              {/* Firewall Info */}
              {executionResult.firewall && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    🛡️ Firewall: {executionResult.firewall.mode}
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>Pre-Check: {executionResult.firewall.preCheck?.allowed ? '✅' : '❌'}</p>
                    <p>Post-Check: {executionResult.firewall.postCheck?.allowed ? '✅' : '❌'}</p>
                  </div>
                </div>
              )}

              {/* Output */}
              {executionResult.output && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Ausgabe:</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-64">
                    {JSON.stringify(executionResult.output, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {executionResult.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-900 mb-2">Fehler:</p>
                  <p className="text-sm text-red-700">{executionResult.error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Führen Sie den Agent aus, um Ergebnisse zu sehen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
