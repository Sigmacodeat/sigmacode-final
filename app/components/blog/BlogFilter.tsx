'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { BlogFilters, BlogCategory, BlogStatus } from '@/types/blog';

interface BlogFilterProps {
  filters: BlogFilters;
  onFiltersChange: (filters: BlogFilters) => void;
  totalPosts: number;
  categories?: BlogCategory[];
}

export function BlogFilter({
  filters,
  onFiltersChange,
  totalPosts,
  categories = [],
}: BlogFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : (status as BlogStatus),
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.category ||
      filters.status ||
      filters.author ||
      filters.dateFrom ||
      filters.dateTo,
  );

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Blog-Artikel durchsuchen..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card text-foreground outline-none focus-visible:ring-2"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--fg)',
            }}
          />
        </div>

        {/* Quick Filter Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--fg)',
          }}
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
            style={{ borderColor: 'var(--destructive)' }}
          >
            <X className="h-4 w-4" />
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border bg-card"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
          }}
        >
          {/* Category Filter */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Kategorie
            </label>
            <select
              value={filters.category || 'all'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background outline-none focus-visible:ring-2"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--fg)',
              }}
            >
              <option value="all">Alle Kategorien</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Status
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background outline-none focus-visible:ring-2"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--fg)',
              }}
            >
              <option value="all">Alle Status</option>
              <option value={BlogStatus.PUBLISHED}>Veröffentlicht</option>
              <option value={BlogStatus.DRAFT}>Entwurf</option>
              <option value={BlogStatus.SCHEDULED}>Geplant</option>
              <option value={BlogStatus.ARCHIVED}>Archiviert</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {totalPosts} Artikel
              {filters.search ? ` für "${filters.search}"` : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
