'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Clock, Eye, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { MostReadPost } from '@/types/blog';

interface MostReadPostsProps {
  posts: MostReadPost[];
  title?: string;
  maxPosts?: number;
  excludeId?: string;
}

export function MostReadPosts({
  posts,
  title = 'Meistgelesene Artikel',
  maxPosts = 5,
  excludeId,
}: MostReadPostsProps) {
  const locale = useLocale();
  const prefix = `/${locale}`;
  const withLocale = (href: string) => {
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))
      return href;
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    if (href === '/') return prefix + '/';
    if (href.startsWith('/#')) return `${prefix}${href}`;
    return `${prefix}${href}`;
  };
  // Filter out excluded post and limit to maxPosts
  const filteredPosts = posts.filter((post) => post.id !== excludeId).slice(0, maxPosts);

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
        <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {filteredPosts.map((post, index) => (
          <GlassCard key={post.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-3">
              {/* Rank indicator */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Link href={withLocale(`/blog/${post.slug}`)} className="block group">
                  <h4
                    className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    style={{ color: 'var(--fg)' }}
                  >
                    {post.title}
                  </h4>
                </Link>

                {/* Meta */}
                <div
                  className="flex items-center gap-3 mt-2 text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.viewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <time dateTime={post.publishedAt.toISOString()}>
                      {post.publishedAt.toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* View all link */}
      <div className="pt-2">
        <Link
          href={withLocale('/blog')}
          className="text-sm font-medium hover:underline transition-colors"
          style={{ color: 'var(--brand-600)' }}
        >
          Alle Artikel anzeigen →
        </Link>
      </div>
    </div>
  );
}
