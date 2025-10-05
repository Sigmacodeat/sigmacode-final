// Advanced Type System for SIGMACODE AI
// Implements branded types, advanced conditional types, and type-safe APIs

import type { User, BlogPost, ApiResponse } from './types';

// ============================
// BRANDED TYPES
// ============================

// Email branded type
export type Email = string & { readonly __brand: 'Email' };
export type UserId = string & { readonly __brand: 'UserId' };
export type BlogPostId = string & { readonly __brand: 'BlogPostId' };
export type SessionId = string & { readonly __brand: 'SessionId' };

// Brand constructors
export const Brand = {
  email: (email: string): Email => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    return email as Email;
  },

  userId: (id: string): UserId => {
    if (!/^user_[a-zA-Z0-9]{16,}$/.test(id)) {
      throw new Error(`Invalid user ID format: ${id}`);
    }
    return id as UserId;
  },

  blogPostId: (id: string): BlogPostId => {
    if (!/^post_[a-zA-Z0-9]{16,}$/.test(id)) {
      throw new Error(`Invalid blog post ID format: ${id}`);
    }
    return id as BlogPostId;
  },

  sessionId: (id: string): SessionId => {
    if (!/^session_[a-zA-Z0-9]{16,}$/.test(id)) {
      throw new Error(`Invalid session ID format: ${id}`);
    }
    return id as SessionId;
  },
} as const;

// ============================
// ADVANCED CONDITIONAL TYPES
// ============================

// Conditional types for API responses
export type ApiResponseData<T> = T extends ApiResponse<infer U> ? U : never;
export type ApiResponseError<T> = T extends ApiResponse<any, infer E> ? E : never;

// Smart type inference for forms
export type FormFieldType<T> = T extends string
  ? 'text'
  : T extends number
    ? 'number'
    : T extends boolean
      ? 'checkbox'
      : 'text';

// User role permissions system
export type UserPermissions = {
  canCreatePosts: boolean;
  canEditPosts: boolean;
  canDeletePosts: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
};

export type UserRole = 'admin' | 'editor' | 'user' | 'guest';

export type PermissionsForRole<R extends UserRole> = R extends 'admin'
  ? UserPermissions
  : R extends 'editor'
    ? Pick<UserPermissions, 'canCreatePosts' | 'canEditPosts' | 'canViewAnalytics'>
    : R extends 'user'
      ? Pick<UserPermissions, 'canCreatePosts'>
      : Record<string, never>;

// ============================
// TYPE-SAFE EVENT SYSTEM
// ============================

export type EventType =
  | 'user:login'
  | 'user:logout'
  | 'user:register'
  | 'post:created'
  | 'post:updated'
  | 'post:deleted'
  | 'analytics:page_view'
  | 'error:occurred';

export interface BaseEvent {
  id: string;
  timestamp: Date;
  userId: UserId | null;
  sessionId: SessionId;
  metadata: Record<string, any>;
}

export interface UserLoginEvent extends BaseEvent {
  type: 'user:login';
  data: {
    email: Email;
    userAgent: string;
    ipAddress: string;
    success: boolean;
  };
}

export interface PostCreatedEvent extends BaseEvent {
  type: 'post:created';
  data: {
    postId: BlogPostId;
    title: string;
    authorId: UserId;
    tags: string[];
  };
}

export type AppEvent = UserLoginEvent | PostCreatedEvent;

// Event handler type
export type EventHandler<T extends AppEvent> = (event: T) => void | Promise<void>;

// ============================
// DATABASE TYPES WITH RELATIONS
// ============================

// Type-safe database query builder
export type DatabaseQuery<T> = {
  select: <K extends keyof T>(fields: K[]) => Pick<T, K>;
  where: (condition: Partial<T>) => T[];
  orderBy: <K extends keyof T>(field: K, direction?: 'asc' | 'desc') => T[];
  limit: (count: number) => T[];
  offset: (count: number) => T[];
  include: <K extends keyof T>(relations: K[]) => T & Record<K, any>;
};

// Type-safe database table definitions
export interface DatabaseTables {
  users: DatabaseQuery<User>;
  blogPosts: DatabaseQuery<BlogPost>;
  sessions: DatabaseQuery<{
    id: string;
    userId: UserId;
    token: string;
    expiresAt: Date;
  }>;
}

// ============================
// CONFIGURATION TYPES
// ============================

// Environment-based configuration with type safety
export type Environment = 'development' | 'staging' | 'production';

export type Config<T extends Environment> = T extends 'production'
  ? ProductionConfig
  : T extends 'staging'
    ? StagingConfig
    : DevelopmentConfig;

interface BaseConfig {
  environment: Environment;
  version: string;
  apiUrl: string;
  cdnUrl: string;
  analytics: {
    enabled: boolean;
    trackingId: string;
    debug: boolean;
  };
  features: Record<string, boolean>;
}

interface DevelopmentConfig extends BaseConfig {
  environment: 'development';
  debug: true;
  hotReload: true;
  mockData: true;
}

interface StagingConfig extends BaseConfig {
  environment: 'staging';
  debug: boolean;
  hotReload: false;
  mockData: boolean;
}

interface ProductionConfig extends BaseConfig {
  environment: 'production';
  debug: false;
  hotReload: false;
  mockData: false;
}

// ============================
// FORM TYPES WITH VALIDATION
// ============================

export type ValidationRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean;
  message?: string;
};

export type FormField<T = any> = {
  name: string;
  type: FormFieldType<T>;
  value: T;
  validation: ValidationRule<T>[];
  errors: string[];
  touched: boolean;
  dirty: boolean;
};

export type FormState<T extends Record<string, any>> = {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
};

// ============================
// API TYPES WITH TYPE SAFETY
// ============================

// Type-safe API client
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiEndpoint<Method extends ApiMethod, RequestData = any, ResponseData = any> = {
  method: Method;
  path: string;
  requestSchema?: (data: RequestData) => boolean;
  responseSchema?: (data: ResponseData) => boolean;
};

// Type-safe API client builder
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<Method extends ApiMethod, RequestData = any, ResponseData = any>(
    endpoint: ApiEndpoint<Method, RequestData, ResponseData>,
    data?: RequestData,
  ): Promise<ResponseData> {
    const url = `${this.baseUrl}${endpoint.path}`;

    if (endpoint.requestSchema && data) {
      if (!endpoint.requestSchema(data)) {
        throw new Error(`Request data does not match schema for ${endpoint.path}`);
      }
    }

    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseDataUnknown = await response.json().catch(() => null);
    const responseData = responseDataUnknown as unknown as ResponseData;

    if (endpoint.responseSchema) {
      if (!endpoint.responseSchema(responseData as unknown as any)) {
        throw new Error(`Response data does not match schema for ${endpoint.path}`);
      }
    }

    return responseData;
  }
}

// ============================
// TYPE-SAFE INTERNATIONALIZATION
// ============================

export type Locale = 'en' | 'de' | 'fr' | 'es';

export type TranslationKeys =
  | 'common:loading'
  | 'common:error'
  | 'common:save'
  | 'common:cancel'
  | 'auth:login'
  | 'auth:logout'
  | 'blog:title'
  | 'blog:readMore';

export type Translations = Record<Locale, Record<TranslationKeys, string>>;

export type I18nFunction = (key: TranslationKeys, params?: Record<string, string>) => string;

// ============================
// ADVANCED ERROR TYPES
// ============================

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'UNKNOWN_ERROR';

export type ErrorResponse = {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
};

// ============================
// TYPE-SAFE ROUTING
// ============================

export type RouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof RouteParams<Rest>]: string }
  : T extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;

export type RouteDefinition<Path extends string, Params = RouteParams<Path>> = {
  path: Path;
  params: Params;
  query?: Record<string, string | string[] | undefined>;
};

// ============================
// PERFORMANCE TYPES
// ============================

export type WebVital = 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';

export type PerformanceMetric = {
  name: WebVital;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
};

export type PerformanceBudget = {
  [K in WebVital]: {
    good: number;
    poor: number;
    unit: string;
  };
};

// ============================
// TYPE-SAFE TESTING
// ============================

export type TestScenario<T> = {
  name: string;
  input: T;
  expected: T;
  description?: string;
};

export type ComponentTestProps<T> = {
  component: React.ComponentType<T>;
  props: T;
  expectedBehavior: string[];
  accessibilityRules?: string[];
};

// ============================
// UTILITY TYPES
// ============================

// Deep partial for updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Require at least one property
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

// Pagination types
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// Filter types
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'like'
  | 'ilike';

export type FilterCondition<T> = {
  [K in keyof T]?: {
    operator: FilterOperator;
    value: any;
  };
};

// ============================
// EXPORT TYPE GUARDS
// ============================

export const TypeGuards = {
  isEmail: (value: any): value is Email => {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  isUserId: (value: any): value is UserId => {
    return typeof value === 'string' && /^user_[a-zA-Z0-9]{16,}$/.test(value);
  },

  isBlogPostId: (value: any): value is BlogPostId => {
    return typeof value === 'string' && /^post_[a-zA-Z0-9]{16,}$/.test(value);
  },

  isSessionId: (value: any): value is SessionId => {
    return typeof value === 'string' && /^session_[a-zA-Z0-9]{16,}$/.test(value);
  },

  isValidEvent: <T extends AppEvent>(value: any, type: T['type']): value is T => {
    return value && typeof value === 'object' && value.type === type;
  },

  isApiResponse: <T>(value: any): value is ApiResponse<T> => {
    return value && typeof value === 'object' && 'success' in value;
  },
} as const;
