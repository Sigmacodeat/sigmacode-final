/**
 * SIGMACODE AI - Dataset Detail Page
 *
 * View and manage documents in a dataset
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Database,
  Upload,
  ArrowLeft,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  FileText,
  Settings,
  RefreshCw,
  Keyboard,
} from 'lucide-react';
import { useDataset, useDocuments } from '@/app/hooks/api/useKnowledge';
import { DocumentsList } from '@/components/knowledge/DocumentsList';
import { UploadDocumentDialog } from '@/components/knowledge/UploadDocumentDialog';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params?.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('doc-search')?.focus();
      }
      // Cmd/Ctrl + U - Upload
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        setUploadDialogOpen(true);
      }
      // Cmd/Ctrl + R - Refresh
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        refetchDocuments();
        refetchDataset();
      }
      // ? - Show shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Escape
      if (e.key === 'Escape') {
        if (showShortcuts) setShowShortcuts(false);
        if (uploadDialogOpen) setUploadDialogOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, uploadDialogOpen]);

  // Fetch dataset
  const {
    data: dataset,
    isPending: datasetLoading,
    isError: datasetError,
    refetch: refetchDataset,
  } = useDataset(datasetId);

  // Fetch documents
  const {
    data: documentsData,
    isPending: documentsLoading,
    isError: documentsError,
    refetch: refetchDocuments,
  } = useDocuments(datasetId, {
    query: searchQuery || undefined,
    limit: 100,
  });

  const documents = documentsData?.documents || [];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (datasetLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div
          className="flex flex-col items-center justify-center py-20"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Dataset wird geladen...</p>
        </div>
      </div>
    );
  }

  if (datasetError || !dataset) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">Dataset nicht gefunden</h3>
            <p className="text-sm text-destructive/80 mb-3">
              Das angeforderte Dataset konnte nicht geladen werden.
            </p>
            <button
              onClick={() => router.push('/dashboard/knowledge')}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/knowledge')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1"
          aria-label="Zurück zur Knowledge Base Übersicht"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Zurück zur Übersicht</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-${dataset.color}-500/10`}>
                <Database className={`h-6 w-6 text-${dataset.color}-500`} />
              </div>
              <h1 className="text-3xl font-bold">{dataset.name}</h1>
            </div>
            {dataset.description && (
              <p className="text-muted-foreground mb-2">{dataset.description}</p>
            )}
            <DashboardBreadcrumbs />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchDocuments();
                refetchDataset();
              }}
              className="p-2 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Aktualisieren"
              title="Aktualisieren (⌘R)"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Tastaturkürzel anzeigen"
              title="Tastaturkürzel (?)"
            >
              <Keyboard className="h-4 w-4" />
            </button>
            <button
              onClick={() => setUploadDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Dokumente hochladen"
              title="Hochladen (⌘U)"
            >
              <Upload className="h-4 w-4" />
              <span>Hochladen</span>
            </button>
            <button
              className="p-2 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Einstellungen"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <FileText className="h-4 w-4" />
            <span>Dokumente</span>
          </div>
          <p className="text-2xl font-bold">{dataset.documentCount}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Database className="h-4 w-4" />
            <span>Größe</span>
          </div>
          <p className="text-2xl font-bold">{formatBytes(dataset.totalSize)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Settings className="h-4 w-4" />
            <span>Chunk Size</span>
          </div>
          <p className="text-2xl font-bold">{dataset.chunkSize}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Database className="h-4 w-4" />
            <span>Model</span>
          </div>
          <p className="text-sm font-medium truncate">{dataset.embeddingModel}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="doc-search"
            type="search"
            placeholder="Dokumente durchsuchen... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            aria-label="Dokumente durchsuchen"
            autoComplete="off"
          />
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Filter anzeigen"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dokumente</h2>
          {documentsData && (
            <span className="text-sm text-muted-foreground">
              {documentsData.total} Dokument{documentsData.total !== 1 ? 'e' : ''}
            </span>
          )}
        </div>

        {documentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : documentsError ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Fehler beim Laden</h3>
              <p className="text-sm text-destructive/80">Dokumente konnten nicht geladen werden</p>
            </div>
          </div>
        ) : (
          <DocumentsList
            documents={documents}
            dataset={dataset}
            onDocumentDeleted={() => {
              refetchDocuments();
              refetchDataset();
            }}
          />
        )}
      </div>

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        datasetId={datasetId}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={() => {
          refetchDocuments();
          refetchDataset();
        }}
      />

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
            aria-labelledby="shortcuts-title-detail"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 id="shortcuts-title-detail" className="text-lg font-semibold">
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
                <span className="text-sm text-muted-foreground">Hochladen</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">⌘U</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Aktualisieren</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">⌘R</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Hilfe anzeigen</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">?</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Zurück</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">ESC</kbd>
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
    </div>
  );
}
