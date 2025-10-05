'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Eye, Heart, MessageCircle, Share2, User, Tag } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { BlogPost, BlogCategory, BlogFilters, BlogStatus, MostReadPost } from '@/types/blog';
import { MostReadPosts } from './MostReadPosts';

interface BlogPostComponentProps {
  post: BlogPost;
  mostReadPosts?: MostReadPost[];
  showSidebar?: boolean;
}

export function BlogPostComponent({
  post,
  mostReadPosts = [],
  showSidebar = true,
}: BlogPostComponentProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const estimatedReadingTime = Math.ceil(post.content.toString().split(' ').length / 200);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-3">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: category.color ? `${category.color}20` : 'var(--accent)',
                    color: category.color || 'var(--accent-foreground)',
                  }}
                >
                  <Tag className="h-3 w-3" />
                  {category.name}
                </Link>
              ))}
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
              style={{ color: 'var(--fg)' }}
            >
              {post.title}
            </h1>

            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {post.excerpt}
            </p>

            {/* Meta Information */}
            <div
              className="flex flex-wrap items-center gap-6 text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author.name || 'Anonym'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt?.toISOString()}>
                  {post.publishedAt?.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{estimatedReadingTime} Min. Lesezeit</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount.toLocaleString()} Aufrufe</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                width={post.featuredImage.width}
                height={post.featuredImage.height}
                className="w-full h-auto"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            {typeof post.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: post.content.html }} />
            )}
          </div>

          {/* Engagement Actions */}
          <div
            className="flex items-center justify-between py-4 border-t border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  liked ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'hover:bg-accent'
                }`}
                style={{ color: liked ? undefined : 'var(--muted-foreground)' }}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm">{likeCount}</span>
              </button>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.commentCount}</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Teilen</span>
            </button>
          </div>

          {/* Author Bio */}
          <div
            className="mt-8 p-6 rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                {post.author.name?.charAt(0) || 'A'}
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--fg)' }}>
                  {post.author.name || 'Anonym'}
                </h4>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  Autor bei SIGMACODE AI
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        {showSidebar && (
          <aside className="lg:col-span-1 space-y-6">
            {/* Most Read Posts */}
            {mostReadPosts.length > 0 && (
              <MostReadPosts posts={mostReadPosts} excludeId={post.id} title="Weitere Artikel" />
            )}

            {/* Categories */}
            {post.categories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--fg)' }}>
                  Kategorien
                </h3>
                <div className="space-y-2">
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog/category/${category.slug}`}
                      className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
