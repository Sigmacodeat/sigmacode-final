/**
 * SIGMACODE AI - Edit Dataset Dialog
 *
 * Modal dialog for editing existing datasets
 */
'use client';

import { useState, useEffect } from 'react';
import { X, Database, Loader2 } from 'lucide-react';
import { useUpdateDataset } from '@/app/hooks/api/useKnowledge';
import type { Dataset, UpdateDatasetInput } from '@/types/knowledge';

interface EditDatasetDialogProps {
  open: boolean;
  dataset: Dataset;
  onClose: () => void;
}

const COLORS = [
  { value: 'blue', label: 'Blau', class: 'bg-blue-500' },
  { value: 'green', label: 'Grün', class: 'bg-green-500' },
  { value: 'purple', label: 'Lila', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Rot', class: 'bg-red-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
];

interface EditDatasetDialogProps {
  open: boolean;
  dataset: Dataset;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditDatasetDialog({ open, dataset, onClose, onSuccess }: EditDatasetDialogProps) {
  const [formData, setFormData] = useState({
    id: dataset.id,
    name: dataset.name,
    description: dataset.description || '',
    color: dataset.color,
    isPublic: dataset.isPublic,
  });

  const updateDataset = useUpdateDataset();

  // Update form when dataset changes
  useEffect(() => {
    setFormData({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description || '',
      color: dataset.color,
      isPublic: dataset.isPublic,
    });
  }, [dataset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updateData: UpdateDatasetInput = {
        id: formData.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        isPublic: formData.isPublic,
      };

      await updateDataset.mutateAsync(updateData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating dataset:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl border shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Dataset bearbeiten</h2>
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
            <label htmlFor="edit-name" className="block text-sm font-medium mb-2">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mein Dataset"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
              Beschreibung
            </label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschreiben Sie den Zweck dieses Datasets..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
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
                  }`}
                  title={color.label}
                  aria-label={`Farbe ${color.label}`}
                >
                  <div className={`h-6 w-6 rounded ${color.class}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Public */}
          <div className="flex items-center gap-3">
            <input
              id="edit-isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="edit-isPublic" className="text-sm">
              Öffentlich zugänglich machen
            </label>
          </div>

          {/* Error */}
          {updateDataset.isError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {updateDataset.error?.message || 'Fehler beim Aktualisieren des Datasets'}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={updateDataset.isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={updateDataset.isPending || !formData.name.trim()}
              className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {updateDataset.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {updateDataset.isPending ? 'Speichere...' : 'Änderungen speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
