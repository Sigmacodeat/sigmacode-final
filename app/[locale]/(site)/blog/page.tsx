'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ThemedCard from '@/components/ui/ThemedCard';
import { Reveal } from '@/components/ui/Reveal';
import { BlogFilter } from '@/components/blog/BlogFilter';
import { BlogFilters, BlogStatus } from '@/types/blog';

const placeholderPosts = [
  {
    slug: 'security-first-ai-firewall',
    title: 'Security‑First AI: Warum eine Agent‑Firewall Pflicht ist',
    excerpt:
      'PII‑Redaction, Prompt‑Guards und Audit‑Transparenz – so schützt du Agenten in Enterprise‑Umgebungen.',
    publishedAt: '2024-01-15',
    author: 'Security Team',
    category: 'Sicherheit',
    readTime: '5 Min.',
  },
  {
    slug: 'soc2-gdpr-hipaa-mappings',
    title: 'SOC 2, GDPR, HIPAA: Praktische Mappings für AI‑Workflows',
    excerpt: 'Welche Kontrollen gelten, wie sammelt man Evidence und wie bleibt man auditfähig?',
    publishedAt: '2024-01-12',
    author: 'Compliance Team',
    category: 'Compliance',
    readTime: '7 Min.',
  },
  {
    slug: 'shadow-to-enforce',
    title: 'Shadow → Enforce: Sichere Migration deiner Policies',
    excerpt: 'Ohne Risiko in Produktion – Shadow‑Mode, Monitoring und schrittweises Enforce.',
    publishedAt: '2024-01-10',
    author: 'DevOps Team',
    category: 'Best Practices',
    readTime: '4 Min.',
  },
  {
    slug: 'agent-workflows-automation',
    title: 'Agent‑Workflows automatisieren: Von MVP zu Production',
    excerpt: 'Wie du robuste, skalierbare AI‑Agent‑Workflows baust und sicher deployt.',
    publishedAt: '2024-01-08',
    author: 'Engineering Team',
    category: 'Workflows',
    readTime: '6 Min.',
  },
  {
    slug: 'pii-detection-prompt-guards',
    title: 'PII‑Detection & Prompt‑Guards: Technical Deep Dive',
    excerpt: 'Regex, ML und Context‑Aware Guards – wie unsere Firewall funktioniert.',
    publishedAt: '2024-01-05',
    author: 'Security Team',
    category: 'Technisch',
    readTime: '8 Min.',
  },
  {
    slug: 'enterprise-ai-governance',
    title: 'Enterprise AI Governance: Framework & Implementation',
    excerpt: 'Governance‑Modelle, RBAC, Audit‑Trails und kontinuierliche Compliance.',
    publishedAt: '2024-01-03',
    author: 'Governance Team',
    category: 'Governance',
    readTime: '9 Min.',
  },
];

export default function BlogIndexPage() {
  const t = useTranslations('blog');
  const [filters, setFilters] = useState<BlogFilters>({});
  const [filteredPosts, setFilteredPosts] = useState(placeholderPosts);

  // Tone-Mapping für Blog-Kategorien → USP-Farbsystem
  const getToneForCategory = (
    category: string,
  ): 'firewall' | 'agents' | 'robotics' | 'appstore' | 'success' | 'danger' | 'brand' => {
    const cat = category.toLowerCase();
    if (cat.includes('sicherheit') || cat.includes('security')) return 'firewall';
    if (cat.includes('compliance') || cat.includes('governance')) return 'success';
    if (cat.includes('workflow') || cat.includes('workflows') || cat.includes('agent'))
      return 'agents';
    if (cat.includes('infrastruktur') || cat.includes('infrastructure')) return 'danger';
    return 'brand';
  };

  // Simple filtering logic (placeholder for real API integration)
  const handleFiltersChange = (newFilters: BlogFilters) => {
    setFilters(newFilters);
    let filtered = [...placeholderPosts];

    if (newFilters.search) {
      const search = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(search) || post.excerpt.toLowerCase().includes(search),
      );
    }

    if (newFilters.category) {
      filtered = filtered.filter((post) => post.category === newFilters.category);
    }

    if (newFilters.status) {
      // For now, all posts are published
      if (newFilters.status !== BlogStatus.PUBLISHED) {
        filtered = [];
      }
    }

    setFilteredPosts(filtered);
  };

  const categories = [
    { id: '1', name: 'Sicherheit', slug: 'sicherheit' },
    { id: '2', name: 'Compliance', slug: 'compliance' },
    { id: '3', name: 'Best Practices', slug: 'best-practices' },
    { id: '4', name: 'Workflows', slug: 'workflows' },
    { id: '5', name: 'Technisch', slug: 'technisch' },
    { id: '6', name: 'Governance', slug: 'governance' },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>
          {t('title')}
        </h1>
        <p className="mt-3 max-w-3xl" style={{ color: 'var(--muted-foreground)' }}>
          {t('subtitle')}
        </p>
      </header>

      {/* Blog Filter */}
      <div className="mb-8">
        <BlogFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalPosts={filteredPosts.length}
          categories={categories}
        />
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {filteredPosts.length} {t('foundArticles')}
        </p>
      </div>

      {/* Blog Posts Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <Reveal key={post.slug}>
            <ThemedCard
              tone={getToneForCategory(post.category)}
              title={post.title}
              description={post.excerpt}
              showSecurity={false}
              className="hover:-translate-y-1 transition-transform duration-300"
              innerClassName="p-6 flex flex-col h-full"
            >
              <div className="mb-3 -mt-1">
                <span
                  className="inline-block px-2 py-1 text-xs font-medium rounded"
                  style={{
                    backgroundColor: 'color-mix(in oklab, var(--brand) 10%, var(--card))',
                    color: 'var(--fg)',
                  }}
                >
                  {post.category}
                </span>
              </div>
              <div className="mt-auto space-y-2">
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                </div>
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <span>{post.publishedAt}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-medium hover:underline"
                    style={{ color: 'var(--brand-600)' }}
                  >
                    {t('readMore')} →
                  </Link>
                </div>
              </div>
            </ThemedCard>
          </Reveal>
        ))}
      </section>

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            {t('noPostsFound')}. {t('tryDifferentKeywords')}.
          </p>
        </div>
      )}
    </main>
  );
}
