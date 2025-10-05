/**
 * SIGMACODE AI - Documents List Component
 *
 * Display list of documents with actions
 */

'use client';
import { useState } from 'react';
import { FileText, Trash2, Calendar, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useDeleteDocument } from '@/app/hooks/api/useKnowledge';
import type { Dataset, Document } from '@/types/knowledge';

interface DocumentsListProps {
  documents: Document[];
  dataset: Dataset;
  onDocumentDeleted?: () => void;
}

export function DocumentsList({ documents, dataset, onDocumentDeleted }: DocumentsListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const deleteDocument = useDeleteDocument();

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument.mutateAsync({ id: documentId, datasetId: dataset.id });
      setDeleteConfirm(null);
      onDocumentDeleted?.();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Fertig';
      case 'processing':
        return 'Verarbeitung';
      case 'failed':
        return 'Fehler';
      default:
        return 'Wartend';
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Keine Dokumente vorhanden</p>
        <p className="text-sm text-muted-foreground mt-2">Laden Sie Ihre ersten Dokumente hoch</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-card rounded-lg border p-4 hover:border-primary/50 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Document Info */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h4 className="font-medium truncate">{doc.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{formatBytes(doc.size)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(doc.status)}
                    {getStatusLabel(doc.status)}
                  </span>
                  {doc.chunkCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{doc.chunkCount} Chunks</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(doc.createdAt), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {deleteConfirm === doc.id ? (
                <>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteDocument.isPending}
                    className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50"
                  >
                    {deleteDocument.isPending ? 'Lösche...' : 'Bestätigen'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleteDocument.isPending}
                    className="px-3 py-1 text-sm border rounded-md hover:bg-accent"
                  >
                    Abbrechen
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(doc.id)}
                  className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  aria-label="Löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {doc.status === 'failed' && doc.processingError && (
            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              {doc.processingError}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
