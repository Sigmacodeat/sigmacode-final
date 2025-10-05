import { NextRequest, NextResponse } from 'next/server';

// Type definitions for search items
interface BaseSearchItem {
  id: string;
  title: string;
}

interface UseCaseItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
}

interface BlogPostItem {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
}

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  category: string;
}

type SearchItem = UseCaseItem | BlogPostItem | FeatureItem;

// Search configuration
const SEARCH_INDEX: Record<string, SearchItem[]> = {
  useCases: [
    {
      id: 'healthcare-medical',
      title: 'Healthcare AI mit HIPAA-Firewall',
      description: 'Medizinische AI-Anwendungen mit HIPAA-Compliance',
      category: 'Healthcare',
      tags: ['HIPAA', 'Patientendaten', 'Medizin', 'Compliance', 'Sicherheit'],
    },
    {
      id: 'financial-trading',
      title: 'Financial Trading mit MiFID II-Firewall',
      description: 'Algorithmic Trading mit Echtzeit-Compliance',
      category: 'Finance',
      tags: ['MiFID II', 'Trading', 'Finanzen', 'Compliance', 'Echtzeit'],
    },
    {
      id: 'government-public',
      title: 'Government AI mit GDPR-Firewall',
      description: 'Öffentliche Verwaltung mit DSGVO-Compliance',
      category: 'Government',
      tags: ['DSGVO', 'Verwaltung', 'Bürgerdaten', 'Compliance', 'Transparenz'],
    },
    {
      id: 'critical-infrastructure',
      title: 'Critical Infrastructure mit OT/IT-Firewall',
      description: 'Kritische Infrastrukturen mit Zero-Downtime-Sicherheit',
      category: 'Infrastructure',
      tags: ['OT/IT', 'Zero-Downtime', 'Infrastruktur', 'Sicherheit', 'IEC 62443'],
    },
    {
      id: 'pharmaceutical-rnd',
      title: 'Pharmaceutical R&D mit FDA-Firewall',
      description: 'Pharma-Forschung mit FDA 21 CFR Part 11-Compliance',
      category: 'Pharmaceutical',
      tags: ['FDA', 'Forschung', 'Pharma', 'Compliance', '21 CFR Part 11'],
    },
  ],
  blogPosts: [
    {
      id: 'security-first-ai-firewall',
      title: 'Security-First AI: Warum eine Agent-Firewall Pflicht ist',
      excerpt: 'PII-Redaction, Prompt-Guards und Audit-Transparenz',
      tags: ['Sicherheit', 'Firewall', 'AI', 'Compliance', 'Best Practices'],
    },
    {
      id: 'soc2-gdpr-hipaa-mappings',
      title: 'SOC 2, GDPR, HIPAA: Praktische Mappings für AI-Workflows',
      excerpt: 'Welche Kontrollen gelten, wie sammelt man Evidence',
      tags: ['SOC2', 'GDPR', 'HIPAA', 'Compliance', 'Mappings'],
    },
  ],
  features: [
    {
      id: 'ai-firewall',
      title: 'AI Firewall',
      description: 'Security-First AI Protection mit PII-Redaction',
      category: 'Security',
    },
    {
      id: 'compliance-engine',
      title: 'Compliance Engine',
      description: 'Automatische Einhaltung von SOC2, GDPR, HIPAA',
      category: 'Compliance',
    },
    {
      id: 'audit-trails',
      title: 'Audit Trails',
      description: 'Vollständige Nachverfolgung aller AI-Interaktionen',
      category: 'Audit',
    },
  ],
};

// Search function
function searchIndex(
  query: string,
  filters?: {
    category?: string;
    tags?: string[];
    type?: 'useCases' | 'blogPosts' | 'features' | 'all';
  },
) {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm || searchTerm.length < 2) {
    return { results: [], total: 0, suggestions: [] };
  }

  const results: (SearchItem & { type: string; score: number })[] = [];
  const allItems: (SearchItem & { type: string })[] = [];

  // Search in all indexes
  Object.entries(SEARCH_INDEX).forEach(([type, items]) => {
    if (filters?.type && filters.type !== 'all' && filters.type !== type) {
      return;
    }

    items.forEach((item) => {
      const searchableText = [
        item.title,
        'description' in item ? item.description : '',
        'excerpt' in item ? item.excerpt : '',
        ...('tags' in item ? item.tags : []),
        'category' in item ? item.category : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      // Check if search term matches
      const matches = searchableText.includes(searchTerm);

      // Boost exact title matches
      const titleMatch = item.title.toLowerCase().includes(searchTerm);
      const categoryMatch = 'category' in item && item.category?.toLowerCase().includes(searchTerm);

      if (matches || titleMatch || categoryMatch) {
        const score = calculateRelevanceScore(item, searchTerm, titleMatch);
        results.push({ ...item, type, score });
        allItems.push({ ...item, type });
      }
    });
  });

  // Sort by relevance score
  results.sort((a, b) => b.score - a.score);

  // Generate suggestions for autocomplete
  const suggestions = generateSuggestions(searchTerm, allItems);

  return {
    results: results.slice(0, 20), // Limit to 20 results
    total: results.length,
    suggestions: suggestions.slice(0, 10),
  };
}

// Calculate relevance score
function calculateRelevanceScore(
  item: SearchItem,
  searchTerm: string,
  titleMatch: boolean,
): number {
  let score = 0;

  // Title matches get highest score
  if (titleMatch) score += 100;

  // Category matches get medium score (only for items that have category)
  if ('category' in item && item.category?.toLowerCase().includes(searchTerm)) score += 50;

  // Tag matches get lower score (only for items that have tags)
  if ('tags' in item && item.tags) {
    item.tags.forEach((tag: string) => {
      if (tag.toLowerCase().includes(searchTerm)) score += 25;
    });
  }

  // Description matches get base score (only for items that have description)
  if ('description' in item && item.description?.toLowerCase().includes(searchTerm)) score += 10;

  // Excerpt matches get base score (only for items that have excerpt)
  if ('excerpt' in item && item.excerpt?.toLowerCase().includes(searchTerm)) score += 10;

  // Exact phrase matches get bonus
  if (item.title.toLowerCase() === searchTerm) score += 200;
  if ('description' in item && item.description?.toLowerCase() === searchTerm) score += 50;
  if ('excerpt' in item && item.excerpt?.toLowerCase() === searchTerm) score += 50;

  return score;
}

// Generate search suggestions
function generateSuggestions(
  searchTerm: string,
  items: (SearchItem & { type: string })[],
): string[] {
  const suggestions = new Set<string>();

  items.forEach((item) => {
    // Add title suggestions
    if (item.title.toLowerCase().includes(searchTerm)) {
      suggestions.add(item.title);
    }

    // Add category suggestions (only for items that have category)
    if ('category' in item && item.category && item.category.toLowerCase().includes(searchTerm)) {
      suggestions.add(item.category);
    }

    // Add tag suggestions (only for items that have tags)
    if ('tags' in item && item.tags) {
      item.tags.forEach((tag: string) => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, 10);
}

// API route handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const type = (searchParams.get('type') || 'all') as
      | 'useCases'
      | 'blogPosts'
      | 'features'
      | 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const searchResults = searchIndex(query, {
      category: category || undefined,
      tags: tags || undefined,
      type,
    });

    // Apply pagination
    const paginatedResults = searchResults.results.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      query,
      results: paginatedResults,
      total: searchResults.total,
      suggestions: searchResults.suggestions,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < searchResults.total,
      },
      filters: {
        category,
        tags,
        type,
      },
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// POST for advanced search with filters
export async function POST(request: NextRequest) {
  try {
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const { query, filters, options } = raw as {
      query?: string;
      filters?: {
        category?: string;
        tags?: string[];
        type?: 'useCases' | 'blogPosts' | 'features' | 'all';
      };
      options?: { limit?: number };
    };

    const searchResults = searchIndex(query || '', filters);

    return NextResponse.json({
      success: true,
      results: searchResults.results.slice(0, options?.limit || 20),
      total: searchResults.total,
      suggestions: searchResults.suggestions,
      facets: generateFacets(searchResults.results),
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json({ error: 'Advanced search failed' }, { status: 500 });
  }
}

// Generate search facets for filtering
function generateFacets(results: (SearchItem & { type: string; score: number })[]) {
  const categories = new Set<string>();
  const tags = new Set<string>();
  const types = new Set<string>();

  results.forEach((result) => {
    if ('category' in result && result.category) categories.add(result.category);
    if ('tags' in result && result.tags) result.tags.forEach((tag: string) => tags.add(tag));
    if (result.type) types.add(result.type);
  });

  return {
    categories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
    types: Array.from(types).sort(),
  };
}
