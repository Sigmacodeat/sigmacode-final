/**
 * SIGMACODE AI - Dataset Card Component
 *
 * Display a single dataset with statistics and actions
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Database,
  FileText,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Dataset } from '@/types/knowledge';

interface DatasetCardProps {
  dataset: Dataset;
  onEdit?: (dataset: Dataset) => void;
  onDelete?: (dataset: Dataset) => void;
  onView?: (dataset: Dataset) => void;
}

export function DatasetCard({ dataset, onEdit, onDelete, onView }: DatasetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <article
      className="group bg-card rounded-xl border hover:border-primary/50 transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary"
      aria-label={`Dataset: ${dataset.name}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                dataset.color === 'blue' && 'bg-blue-500/10 text-blue-500',
                dataset.color === 'green' && 'bg-green-500/10 text-green-500',
                dataset.color === 'purple' && 'bg-purple-500/10 text-purple-500',
                dataset.color === 'orange' && 'bg-orange-500/10 text-orange-500',
                !['blue', 'green', 'purple', 'orange'].includes(dataset.color) &&
                  'bg-primary/10 text-primary',
              )}
              aria-hidden="true"
            >
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {onView ? (
                  <button
                    onClick={() => onView(dataset)}
                    className="hover:text-primary transition-colors focus:outline-none focus:underline text-left"
                    aria-label={`${dataset.name} öffnen`}
                  >
                    {dataset.name}
                  </button>
                ) : (
                  dataset.name
                )}
              </h3>
              {dataset.isPublic && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  Öffentlich
                </span>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setMenuOpen(false);
              }}
              className="p-2 rounded-md hover:bg-accent opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Aktionen-Menü"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-popover border rounded-lg shadow-lg z-20"
                role="menu"
                aria-label="Dataset Aktionen"
              >
                {onView && (
                  <button
                    onClick={() => {
                      onView(dataset);
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 rounded-t-lg focus:outline-none focus:bg-accent"
                    role="menuitem"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Öffnen
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(dataset);
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 focus:outline-none focus:bg-accent"
                    role="menuitem"
                  >
                    <Edit className="h-4 w-4" aria-hidden="true" />
                    Bearbeiten
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(dataset);
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2 rounded-b-lg focus:outline-none focus:bg-destructive/10"
                    role="menuitem"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Löschen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {dataset.description && (
          <p
            className="text-sm text-muted-foreground mb-4 line-clamp-2"
            title={dataset.description}
          >
            {dataset.description}
          </p>
        )}

        {/* Tags */}
        {dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {dataset.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-secondary/50 rounded-md">
                {tag}
              </span>
            ))}
            {dataset.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{dataset.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>Dokumente</span>
            </div>
            <p className="text-2xl font-bold" aria-label={`${dataset.documentCount} Dokumente`}>
              {dataset.documentCount}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Database className="h-4 w-4" aria-hidden="true" />
              <span>Größe</span>
            </div>
            <p
              className="text-2xl font-bold"
              aria-label={`Größe: ${formatBytes(dataset.totalSize)}`}
            >
              {formatBytes(dataset.totalSize)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          <time dateTime={dataset.createdAt}>
            Erstellt{' '}
            {formatDistanceToNow(new Date(dataset.createdAt), { addSuffix: true, locale: de })}
          </time>
        </div>
      </div>
    </article>
  );
}
