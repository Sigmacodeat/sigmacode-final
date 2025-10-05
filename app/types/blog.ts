import type { User } from '@/database/schema';

// Blog Status enum
export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
}

// Blog Category
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

// Featured Image
export interface FeaturedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

// Blog Post interface matching Prisma schema
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | { raw: string; html: string };
  excerpt: string;
  status: BlogStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: FeaturedImage | null;

  // Relations
  author: User;
  authorId: string;

  // Categories (many-to-many)
  categories: BlogCategory[];

  // Engagement metrics
  viewCount: number;
  likeCount: number;
  commentCount: number;

  // Timestamps
  scheduledFor?: Date | null;
}

// Blog API Response types
export interface BlogPostsResponse {
  posts: BlogPost[];
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  currentPage: number;
}

// Blog Filter types
export interface BlogFilters {
  search?: string;
  category?: string;
  status?: BlogStatus;
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

// API Request types
export interface CreateBlogPostRequest {
  title: string;
  content: string | { raw: string; html: string };
  excerpt: string;
  status: BlogStatus;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: FeaturedImage;
  categoryIds?: string[];
  scheduledFor?: Date;
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  id: string;
}

// Blog Stats types
export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface MostReadPost {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  publishedAt: Date;
  featuredImage?: FeaturedImage | null;
  excerpt?: string;
}

// Time Range for analytics
export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

export interface TimeRangeData {
  date: string;
  count: number;
  label: string;
}

// API Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Blog Hook return types
export interface UseBlogPostsReturn {
  posts: BlogPost[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export interface UseBlogPostReturn {
  post: BlogPost | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export interface UsePublishPostReturn {
  publish: (id: string) => Promise<void>;
  unpublish: (id: string) => Promise<void>;
  isPublishing: boolean;
  error: ApiError | null;
}

export interface UseDeletePostReturn {
  deletePost: (id: string) => Promise<void>;
  isDeleting: boolean;
  error: ApiError | null;
}
