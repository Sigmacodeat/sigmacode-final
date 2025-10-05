// /app/lib/api/responses.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  version: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// Standard API Error Codes
export const API_ERROR_CODES = {
  // Client Errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Custom Business Logic Errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
} as const;

// HTTP Status Code Mapping
export const HTTP_STATUS_MAP: Record<string, number> = {
  [API_ERROR_CODES.BAD_REQUEST]: 400,
  [API_ERROR_CODES.UNAUTHORIZED]: 401,
  [API_ERROR_CODES.FORBIDDEN]: 403,
  [API_ERROR_CODES.NOT_FOUND]: 404,
  [API_ERROR_CODES.CONFLICT]: 409,
  [API_ERROR_CODES.VALIDATION_ERROR]: 400,
  [API_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  [API_ERROR_CODES.DATABASE_ERROR]: 503,
  [API_ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 502,
  [API_ERROR_CODES.RESOURCE_NOT_FOUND]: 404,
  [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 403,
  [API_ERROR_CODES.SUBSCRIPTION_REQUIRED]: 402,
  [API_ERROR_CODES.QUOTA_EXCEEDED]: 429,
};

// API Response Builder Functions
export function createSuccessResponse<T>(
  data: T,
  version: string = 'v1',
  requestId?: string,
): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    version,
    ...(requestId && { requestId }),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  statusCode?: number,
  details?: any,
  field?: string,
  version: string = 'v1',
  requestId?: string,
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(field && { field }),
    },
    timestamp: new Date().toISOString(),
    version,
    ...(requestId && { requestId }),
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  version: string = 'v1',
  requestId?: string,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString(),
    version,
    ...(requestId && { requestId }),
  };
}

// Validation Error Helper
export function createValidationErrorResponse(
  errors: Record<string, string>,
  version: string = 'v1',
  requestId?: string,
): ApiResponse {
  return createErrorResponse(
    API_ERROR_CODES.VALIDATION_ERROR,
    'Validation failed',
    HTTP_STATUS_MAP[API_ERROR_CODES.VALIDATION_ERROR],
    { fieldErrors: errors },
    undefined,
    version,
    requestId,
  );
}

// Rate Limit Helper
export function createRateLimitResponse(
  retryAfter: number,
  version: string = 'v1',
  requestId?: string,
): ApiResponse {
  return createErrorResponse(
    API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded',
    HTTP_STATUS_MAP[API_ERROR_CODES.RATE_LIMIT_EXCEEDED],
    { retryAfter },
    undefined,
    version,
    requestId,
  );
}
