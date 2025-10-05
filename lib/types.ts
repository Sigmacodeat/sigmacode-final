import type { User } from '@/database/schema';

// API Response type for type-safe API responses
export interface ApiResponse<T = any, E = any> {
  success: boolean;
  data?: T;
  error?: E;
  timestamp: string;
  requestId: string;
}

// Re-export User type from database schema
export type { User };

// Re-export BlogPost type from app types
export type { BlogPost } from '@/types/blog';
