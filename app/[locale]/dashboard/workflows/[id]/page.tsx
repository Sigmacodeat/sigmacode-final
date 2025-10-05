/**
 * SIGMACODE AI - Workflow Detail Page
 *
 * Einzelansicht und Editor für AI-Workflows
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Workflow,
  Shield,
  ArrowLeft,
  Settings,
  Play,
  Pause,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import WorkflowPipeline from '@/components/workflows/WorkflowPipeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDifyHealth } from '@/app/hooks/useDifyHealth';

type WorkflowData = {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'draft' | 'published' | 'archived';
  firewall?: {
    enabled: boolean;
    mode: 'enforce' | 'shadow';
  };
  createdAt: string;
  updatedAt: string;
};

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'de';
  const workflowId = params?.id as string;

  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const DIFY_URL = process.env.NEXT_PUBLIC_DIFY_URL || 'http://localhost:5001';
  const { ok: difyOk } = useDifyHealth(DIFY_URL);

  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/workflows/${workflowId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Workflow nicht gefunden');
        }
        throw new Error('Workflow konnte nicht geladen werden');
      }

      const data = await response.json();
      setWorkflow(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!workflow) return;

    try {
      setActionLoading(true);
      const newStatus = workflow.status === 'published' ? 'draft' : 'published';

      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Status konnte nicht geändert werden');

      await loadWorkflow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setActionLoading(true);

      const response = await fetch(`/api/workflows/${workflowId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Workflow konnte nicht dupliziert werden');

      const data = await response.json();
      router.push(`/${locale}/dashboard/workflows/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diesen Workflow wirklich löschen?')) return;

    try {
      setActionLoading(true);

      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Workflow konnte nicht gelöscht werden');

      router.push(`/${locale}/dashboard/workflows`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/${locale}/dashboard/workflows`}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Workflows
          </Link>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            {error || 'Workflow nicht gefunden'}
          </h2>
          <Link href={`/${locale}/dashboard/workflows`}>
            <Button variant="outline" className="mt-4">
              Zurück zur Übersicht
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link
            href={`/${locale}/dashboard/workflows`}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Workflows
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Workflow className="h-8 w-8 text-primary" />
              {workflow.name}
            </h1>
            {workflow.description && (
              <p className="text-muted-foreground mt-2">{workflow.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={workflow.status === 'published' ? 'brand' : 'soft'}>
                {workflow.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
              </Badge>
              <Badge variant="outline">{workflow.type}</Badge>
              {workflow.firewall?.enabled && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Firewall: {workflow.firewall.mode}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              variant="outline"
              size="sm"
            >
              {workflow.status === 'published' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausieren
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Veröffentlichen
                </>
              )}
            </Button>

            <Button onClick={handleDuplicate} disabled={actionLoading} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Duplizieren
            </Button>

            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">Fehler</p>
          </div>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Pipeline Overview */}
      <WorkflowPipeline />

      {/* Content Tabs */}
      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {/* Embedded Dify Editor */}
          {difyOk ? (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="border-b bg-muted/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Workflow Editor</span>
                </div>
                <a
                  href={`${DIFY_URL}/app/${workflowId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  In Backend öffnen
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <iframe
                src={`${DIFY_URL}/app/${workflowId}`}
                className="w-full h-[600px] border-0"
                title="SIGMACODE AI Workflow Editor"
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Backend nicht erreichbar</h3>
              <p className="text-muted-foreground mb-4">
                Der SIGMACODE AI Backend-Service ist momentan nicht verfügbar.
              </p>
              <a href={`${DIFY_URL}/app/${workflowId}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Extern öffnen
                </Button>
              </a>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* General Settings */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Allgemein
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{workflow.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ:</span>
                  <span>{workflow.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Erstellt:</span>
                  <span>{new Date(workflow.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aktualisiert:</span>
                  <span>{new Date(workflow.updatedAt).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            </div>

            {/* Firewall Settings */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Neural Firewall
              </h3>
              {workflow.firewall?.enabled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Firewall aktiv im {workflow.firewall.mode} Modus</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Alle Requests werden automatisch auf Threats, Prompt Injections und PII-Leaks
                    geprüft.
                  </p>
                  <Link href={`/${locale}/dashboard/firewall`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Firewall-Einstellungen
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Firewall ist deaktiviert</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aktivieren Sie die Neural Firewall für maximale Sicherheit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">Logs-Ansicht wird geladen...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Integration mit dem Logging-System in Arbeit
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">Analytics-Dashboard wird geladen...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Integration mit dem Analytics-System in Arbeit
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
