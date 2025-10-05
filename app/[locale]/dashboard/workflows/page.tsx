/**
 * SIGMACODE AI - Workflows Overview Page
 *
 * Übersicht aller AI-Workflows mit Firewall-Integration
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Workflow,
  Plus,
  ExternalLink,
  Search,
  Filter,
  Shield,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Edit3,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import WorkflowPipeline from '@/components/workflows/WorkflowPipeline';
import { useDifyHealth } from '@/app/hooks/useDifyHealth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type WorkflowItem = {
  id: string;
  name: string;
  description?: string;
  type: 'chatbot' | 'completion' | 'workflow' | 'agent';
  status: 'draft' | 'published' | 'archived';
  firewall?: {
    enabled: boolean;
    mode: 'enforce' | 'shadow';
  };
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionCount?: number;
};

export default function WorkflowsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'de';

  const DIFY_URL = process.env.NEXT_PUBLIC_DIFY_URL || 'http://localhost:5001';
  const { ok: difyOk, loading: difyChecking } = useDifyHealth(DIFY_URL);

  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/workflows');

      if (!response.ok) {
        throw new Error('Workflows konnten nicht geladen werden');
      }

      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workflow: WorkflowItem) => {
    const confirmed = window.confirm(
      `Möchten Sie den Workflow "${workflow.name}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Workflow konnte nicht gelöscht werden');

      await loadWorkflows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setDeleting(false);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || w.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Workflow className="h-8 w-8 text-primary" />
            AI Workflows
          </h1>
          <p className="text-muted-foreground mt-1">
            Erstelle und verwalte Firewall-geschützte AI-Workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadWorkflows}
            disabled={loading}
            aria-label="Workflows aktualisieren"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <a
            href={`${DIFY_URL}/apps`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Backend Console öffnen (öffnet in neuem Tab)"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Backend Console
            </Button>
          </a>
          <Link href={`/${locale}/dashboard/workflows/new`}>
            <Button aria-label="Neuen Workflow erstellen">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Workflow
            </Button>
          </Link>
        </div>
      </div>

      {/* Backend Status */}
      {!difyChecking && !difyOk && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Backend nicht erreichbar</p>
          </div>
          <p className="mt-1 text-sm">
            Das SIGMACODE AI Backend ist momentan nicht verfügbar. Workflows können nicht bearbeitet
            werden.
          </p>
        </div>
      )}

      {/* Pipeline Overview */}
      <WorkflowPipeline />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3" role="search" aria-label="Workflow-Filter">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Workflows durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Suche nach Workflow-Name oder Beschreibung"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Status-Filter auswählen">
            <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="published">Veröffentlicht</SelectItem>
            <SelectItem value="draft">Entwürfe</SelectItem>
            <SelectItem value="archived">Archiviert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workflows List */}
      {loading ? (
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          role="grid"
          aria-label="Workflow-Liste lädt"
        >
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="rounded-lg border bg-card p-6 animate-pulse"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-8 w-8 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded-full w-16"></div>
                  <div className="h-6 bg-muted rounded-full w-20"></div>
                </div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Fehler</h3>
          <p className="text-red-700">{error}</p>
          <Button onClick={loadWorkflows} variant="outline" className="mt-4">
            Erneut versuchen
          </Button>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || filterStatus !== 'all'
              ? 'Keine Workflows gefunden'
              : 'Noch keine Workflows'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterStatus !== 'all'
              ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
              : 'Erstellen Sie Ihren ersten Firewall-geschützten AI-Workflow.'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Link href={`/${locale}/dashboard/workflows/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Workflow
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          role="grid"
          aria-label="Workflow-Liste"
        >
          {filteredWorkflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="rounded-lg border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              role="gridcell"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate mb-1">{workflow.name}</h3>
                    {workflow.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {workflow.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/${locale}/dashboard/workflows/${workflow.id}`)}
                      aria-label={`Workflow ${workflow.name} bearbeiten`}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(workflow)}
                      disabled={deleting}
                      aria-label={`Workflow ${workflow.name} löschen`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant={workflow.status === 'published' ? 'brand' : 'soft'}
                    className={
                      workflow.status === 'published'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : ''
                    }
                  >
                    {workflow.status === 'published' ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Aktiv
                      </>
                    ) : workflow.status === 'draft' ? (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Entwurf
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Archiviert
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {workflow.type}
                  </Badge>
                  {workflow.firewall?.enabled && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Firewall: {workflow.firewall.mode}
                    </Badge>
                  )}
                  {workflow.executionCount && (
                    <Badge variant="outline" className="text-xs">
                      {workflow.executionCount} Ausführungen
                    </Badge>
                  )}
                </div>

                <Link href={`/${locale}/dashboard/workflows/${workflow.id}`}>
                  <Button variant="outline" className="w-full">
                    Details ansehen
                  </Button>
                </Link>
              </div>

              <div className="border-t px-6 py-3 bg-muted/50 text-xs text-muted-foreground flex justify-between items-center">
                <span>
                  Aktualisiert: {new Date(workflow.updatedAt).toLocaleDateString('de-DE')}
                </span>
                {workflow.lastExecutedAt && (
                  <span>
                    Letzte Ausführung:{' '}
                    {new Date(workflow.lastExecutedAt).toLocaleDateString('de-DE')}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
