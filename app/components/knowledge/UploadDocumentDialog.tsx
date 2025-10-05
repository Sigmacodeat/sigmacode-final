/**
 * SIGMACODE AI - Upload Document Dialog
 *
 * Modal dialog for uploading documents to datasets
 */

'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useUploadDocument } from '@/app/hooks/api/useKnowledge';

interface UploadDocumentDialogProps {
  open: boolean;
  datasetId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadDocumentDialog({
  open,
  datasetId,
  onClose,
  onSuccess,
}: UploadDocumentDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadDocument = useUploadDocument();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Upload files sequentially
      for (const file of selectedFiles) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Datei "${file.name}" ist zu groß. Maximum: 10MB`);
        }

        await uploadDocument.mutateAsync({
          datasetId,
          file,
        });
      }

      onSuccess?.();
      onClose();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading documents:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => !uploadDocument.isPending && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && !uploadDocument.isPending && onClose()}
    >
      <div
        className="bg-background rounded-xl border shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="upload-dialog-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <h2 id="upload-dialog-title" className="text-xl font-semibold">
              Dokumente hochladen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            role="button"
            aria-label="Drag-and-Drop-Bereich für Dateien"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-medium mb-2">Dateien hierher ziehen oder</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline font-medium"
            >
              Dateien auswählen
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".txt,.md,.pdf,.doc,.docx,.csv,.json,.html"
              aria-label="Dateien auswählen"
            />
            <p className="text-sm text-muted-foreground mt-4">
              Unterstützt: TXT, MD, PDF, DOC, DOCX, CSV, JSON, HTML (max. 10MB pro Datei)
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3" aria-live="polite">
                Ausgewählte Dateien ({selectedFiles.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                      }}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive flex-shrink-0"
                      aria-label="Entfernen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {uploadDocument.isSuccess && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Dokumente erfolgreich hochgeladen!
            </div>
          )}

          {uploadDocument.isError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {uploadDocument.error?.message || 'Fehler beim Hochladen'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} Datei(en) ausgewählt`
              : 'Keine Dateien ausgewählt'}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleUpload}
              disabled={uploadDocument.isPending || selectedFiles.length === 0}
              className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={
                uploadDocument.isPending
                  ? 'Wird hochgeladen'
                  : `${selectedFiles.length} Datei(en) hochladen`
              }
            >
              {uploadDocument.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {uploadDocument.isPending ? 'Lade hoch...' : 'Hochladen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
