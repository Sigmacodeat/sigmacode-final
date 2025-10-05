// /app/lib/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { ApiResponse, createErrorResponse, createSuccessResponse } from './responses';
import { ApiException } from './exceptions';

// Request/Response Middleware Types
export interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: boolean;
  cors?: boolean;
  requestTimeout?: number;
  validateInput?: boolean;
}

export interface ApiRequest extends NextRequest {
  userId?: string;
  userRoles?: string[];
  requestId: string;
  startTime: number;
}

export interface ApiHandler<T = any> {
  (req: ApiRequest, ...args: any[]): Promise<NextResponse<ApiResponse<T>>>;
}

// API Request Handler Wrapper
export function withApiMiddleware<T = any>(
  handler: ApiHandler<T>,
  options: ApiMiddlewareOptions = {},
) {
  return async (req: NextRequest, ...args: any[]) => {
    const requestId = randomUUID();
    const startTime = Date.now();
    const apiRequest = req as ApiRequest;

    // Add metadata to request
    apiRequest.requestId = requestId;
    apiRequest.startTime = startTime;

    try {
      // CORS handling
      if (options.cors) {
        const corsHeaders = {
          'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
        };

        if (req.method === 'OPTIONS') {
          return new NextResponse(null, { status: 200, headers: corsHeaders });
        }
      }

      // Request timeout
      if (options.requestTimeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.requestTimeout);

        // Note: In Next.js API routes, we can't directly use AbortController with fetch
        // This is a placeholder for future implementation
        clearTimeout(timeoutId);
      }

      // Authentication check
      if (options.requireAuth) {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          throw new ApiException('UNAUTHORIZED', 'Authentication required');
        }
        // JWT validation wird durch NextAuth in den API-Routes gehandhabt
      }

      // Execute the actual handler
      const result = await handler(apiRequest, ...args);

      // Add standard headers
      const headers = new Headers(result.headers);
      headers.set('X-Request-ID', requestId);
      headers.set('X-Response-Time', (Date.now() - startTime).toString());

      return new NextResponse(result.body, {
        ...result,
        headers,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Handle known API exceptions
      if (error instanceof ApiException) {
        const errorResponse = createErrorResponse(
          error.code,
          error.message,
          error.statusCode,
          error.details,
          error.field,
          'v1',
          requestId,
        );

        return NextResponse.json(errorResponse, {
          status: error.statusCode,
          headers: {
            'X-Request-ID': requestId,
            'X-Response-Time': responseTime.toString(),
          },
        });
      }

      // Handle unknown errors
      console.error('Unhandled API error:', error);

      const errorResponse = createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        500,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        undefined,
        'v1',
        requestId,
      );

      return NextResponse.json(errorResponse, {
        status: 500,
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': responseTime.toString(),
        },
      });
    }
  };
}

// Utility function to extract pagination parameters
export function parsePaginationParams(req: ApiRequest): {
  page: number;
  limit: number;
} {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

  return { page, limit };
}

// Utility function to create pagination metadata
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
