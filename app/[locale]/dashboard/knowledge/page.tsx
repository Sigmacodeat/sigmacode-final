'use client';

/**
 * SIGMACODE AI - Knowledge Base / Datasets
 * Vollständige Dokumenten-Verwaltung mit RAG-Support
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Upload,
  FileText,
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Keyboard,
  RefreshCw,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';
import { useDatasets, useDeleteDataset } from '@/app/hooks/api/useKnowledge';
import { useToast } from '@/components/ui/toast-context';
import { DatasetCard } from '@/components/knowledge/DatasetCard';
import { CreateDatasetDialog } from '@/components/knowledge/CreateDatasetDialog';
import { EditDatasetDialog } from '@/components/knowledge/EditDatasetDialog';
import { useRouter } from 'next/navigation';
import type { Dataset } from '@/types/knowledge';

export default function KnowledgePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDataset, setEditDataset] = useState<Dataset | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Dataset | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Fetch datasets with search
  const { data, isPending, isError, error, refetch } = useDatasets({
    query: searchQuery || undefined,
    limit: 50,
  });

  const deleteDataset = useDeleteDataset();

  const datasets = data?.datasets || [];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('dataset-search')?.focus();
      }
      // Cmd/Ctrl + N - New dataset
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setCreateDialogOpen(true);
      }
      // Cmd/Ctrl + R - Refresh
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        refetch();
      }
      // ? - Show shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Escape - Close shortcuts
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, refetch]);

  const handleViewDataset = useCallback(
    (dataset: Dataset) => {
      router.push(`/dashboard/knowledge/${dataset.id}`);
    },
    [router],
  );

  const handleDeleteDataset = useCallback(
    async (dataset: Dataset) => {
      try {
        await deleteDataset.mutateAsync(dataset.id);
        toast({
          title: 'Dataset gelöscht',
          description: `"${dataset.name}" wurde erfolgreich gelöscht.`,
        });
        setDeleteConfirm(null);
      } catch (error) {
        toast({
          title: 'Fehler',
          description:
            error instanceof Error ? error.message : 'Dataset konnte nicht gelöscht werden',
          variant: 'destructive',
        });
      }
    },
    [deleteDataset, toast],
  );

  const handleCreateSuccess = useCallback(() => {
    refetch();
    toast({
      title: 'Dataset erstellt',
      description: 'Ihr neues Dataset wurde erfolgreich erstellt.',
    });
  }, [refetch, toast]);

  const handleEditSuccess = useCallback(() => {
    refetch();
    toast({
      title: 'Dataset aktualisiert',
      description: 'Die Änderungen wurden erfolgreich gespeichert.',
    });
  }, [refetch, toast]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg" aria-hidden="true">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
          </div>
          <p className="text-muted-foreground">Verwalten Sie Ihre Dokumente und Datasets für RAG</p>
          <DashboardBreadcrumbs />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center p-2 border rounded-lg hover:bg-accent transition-colors"
            aria-label="Aktualisieren"
            title="Aktualisieren (⌘R)"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowShortcuts(true)}
            className="inline-flex items-center justify-center p-2 border rounded-lg hover:bg-accent transition-colors"
            aria-label="Tastaturkürzel anzeigen"
            title="Tastaturkürzel (?)"
          >
            <Keyboard className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Neues Dataset erstellen"
            title="Neues Dataset (⌘N)"
          >
            <Plus className="h-4 w-4" />
            <span>Neues Dataset</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="dataset-search"
            type="search"
            placeholder="Datasets durchsuchen... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            aria-label="Datasets durchsuchen"
            autoComplete="off"
          />
        </div>
        <button
          className="inline-flex items-center space-x-2 px-4 py-3 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Filter anzeigen"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">Fehler beim Laden</h3>
            <p className="text-sm text-destructive/80">
              {error?.message || 'Datasets konnten nicht geladen werden'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 text-sm bg-destructive/20 hover:bg-destructive/30 rounded-lg transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isPending && !isError && datasets.length === 0 && !searchQuery && (
        <div className="text-center py-20">
          <div className="inline-flex p-6 bg-primary/5 rounded-full mb-6">
            <Database className="h-16 w-16 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Keine Datasets vorhanden</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Erstellen Sie Ihr erstes Dataset und laden Sie Dokumente hoch für KI-gestützte Antworten
            mit RAG.
          </p>
          <div className="flex items-center justify-center space-x-4 flex-wrap gap-4">
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Dataset erstellen</span>
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {!isPending && !isError && datasets.length === 0 && searchQuery && (
        <div className="text-center py-20">
          <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-bold mb-2">Keine Ergebnisse</h2>
          <p className="text-muted-foreground mb-4">
            Keine Datasets gefunden für &quot;{searchQuery}&quot;
          </p>
          <button onClick={() => setSearchQuery('')} className="text-primary hover:underline">
            Suche zurücksetzen
          </button>
        </div>
      )}

      {/* Datasets Grid */}
      {!isPending && !isError && datasets.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {datasets.map((dataset: Dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                onView={handleViewDataset}
                onEdit={(dataset) => setEditDataset(dataset)}
                onDelete={(dataset) => setDeleteConfirm(dataset)}
              />
            ))}
          </div>

          {/* Stats Summary */}
          <div className="bg-card rounded-xl p-6 border">
            <h3 className="font-semibold mb-4">Zusammenfassung</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Datasets</p>
                <p className="text-2xl font-bold">{data?.total || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dokumente</p>
                <p className="text-2xl font-bold">
                  {datasets.reduce((sum: number, d: Dataset) => sum + d.documentCount, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gesamtgröße</p>
                <p className="text-2xl font-bold">
                  {(() => {
                    const totalBytes = datasets.reduce(
                      (sum: number, d: Dataset) => sum + d.totalSize,
                      0,
                    );
                    const mb = (totalBytes / (1024 * 1024)).toFixed(1);
                    return `${mb} MB`;
                  })()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Unterstützte Formate</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• PDF, DOCX, TXT</li>
            <li>• Markdown, HTML</li>
            <li>• CSV, JSON</li>
            <li>• Web-Scraping</li>
          </ul>
        </div>

        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Database className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="font-semibold">RAG-Funktionen</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Vector-Embeddings</li>
            <li>• Semantic Search</li>
            <li>• Chunk-Management</li>
            <li>• Multi-Dataset</li>
          </ul>
        </div>

        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Upload className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-semibold">Import-Optionen</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• File-Upload</li>
            <li>• URL-Import</li>
            <li>• API-Integration</li>
            <li>• Bulk-Upload</li>
          </ul>
        </div>
      </div>

      {/* Dialogs */}
      <CreateDatasetDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {editDataset && (
        <EditDatasetDialog
          open={!!editDataset}
          dataset={editDataset}
          onClose={() => setEditDataset(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-background rounded-xl border shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="shortcuts-title"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 id="shortcuts-title" className="text-lg font-semibold">
                Tastaturkürzel
              </h3>
              <Keyboard className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Suche fokussieren</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">⌘K</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Neues Dataset</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">⌘N</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Aktualisieren</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">⌘R</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Hilfe anzeigen</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">?</kbd>
              </div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !deleteDataset.isPending && setDeleteConfirm(null)}
        >
          <div
            className="bg-background rounded-xl border shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
          >
            <h3 id="delete-title" className="text-lg font-semibold mb-2">
              Dataset löschen?
            </h3>
            <p id="delete-description" className="text-sm text-muted-foreground mb-6">
              Möchten Sie das Dataset &quot;{deleteConfirm.name}&quot; wirklich löschen? Dies löscht
              auch alle zugehörigen Dokumente und kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteDataset.isPending}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDeleteDataset(deleteConfirm)}
                disabled={deleteDataset.isPending}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {deleteDataset.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleteDataset.isPending ? 'Wird gelöscht...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
