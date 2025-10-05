/**
 * SIGMACODE AI - Create Dataset Dialog
 *
 * Modal dialog for creating new datasets
 */
'use client';

import { useState } from 'react';
import { X, Database, Loader2 } from 'lucide-react';
import { useCreateDataset } from '@/app/hooks/api/useKnowledge';
import type { Dataset, CreateDatasetInput } from '@/types/knowledge';

interface CreateDatasetDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onDatasetCreated?: (dataset: Dataset) => void;
}

const COLORS = [
  { value: 'blue', label: 'Blau', class: 'bg-blue-500' },
  { value: 'green', label: 'Grün', class: 'bg-green-500' },
  { value: 'purple', label: 'Lila', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Rot', class: 'bg-red-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
];

export function CreateDatasetDialog({ open, onClose, onSuccess }: CreateDatasetDialogProps) {
  const [formData, setFormData] = useState<CreateDatasetInput>({
    name: '',
    description: '',
    color: 'blue',
    isPublic: false,
  });

  const createDataset = useCreateDataset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    if (!formData.name.trim()) {
      return;
    }

    // Trim whitespace
    const trimmedData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
    };

    try {
      await createDataset.mutateAsync(trimmedData);
      onSuccess?.();
      onClose();
      setFormData({
        name: '',
        description: '',
        color: 'blue',
        isPublic: false,
      });
    } catch (error) {
      console.error('Error creating dataset:', error);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="bg-background rounded-xl border shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="create-dataset-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h2 id="create-dataset-title" className="text-xl font-semibold">
              Neues Dataset
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name{' '}
              <span className="text-destructive" aria-label="Pflichtfeld">
                *
              </span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mein Dataset"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              aria-required="true"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Beschreibung
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschreiben Sie den Zweck dieses Datasets..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={500}
            />
            {formData.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/500 Zeichen
              </p>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Farbe</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`p-3 rounded-lg border-2 ${
                    formData.color === color.value
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-border'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  title={color.label}
                  aria-label={`Farbe ${color.label} auswählen`}
                  aria-pressed={formData.color === color.value}
                >
                  <div className={`h-6 w-6 rounded ${color.class}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {/* Public */}
          <div className="flex items-center gap-3">
            <input
              id="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="isPublic" className="text-sm">
              Öffentlich zugänglich machen
            </label>
          </div>

          {/* Error */}
          {createDataset.isError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {createDataset.error?.message || 'Fehler beim Erstellen des Datasets'}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={createDataset.isPending || !formData.name.trim()}
              className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {createDataset.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createDataset.isPending ? 'Erstelle...' : 'Dataset erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
