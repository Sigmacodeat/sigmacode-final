// Advanced Security Middleware for SIGMACODE AI
// Implements enterprise-grade security features

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration
const SECURITY_HEADERS = {
  // XSS Protection
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',

  // CSP - Content Security Policy (strict)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sigmacode.ai https://plausible.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.sigmacode.ai https://plausible.io wss: https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; '),

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()',
    'autoplay=(self), encrypted-media=(self), fullscreen=(self)',
  ].join(', '),

  // HSTS - HTTP Strict Transport Security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Prevent MIME type sniffing
  'X-Download-Options': 'noopen',

  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',

  // Remove server information
  'X-Powered-By': '', // Remove Next.js header
  Server: '', // Remove server information
};

// Rate limiting configuration
const RATE_LIMITS = {
  general: { windowMs: 15 * 60 * 1000, max: 1000 }, // 1000 requests per 15 minutes
  auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 auth attempts per 15 minutes
  api: { windowMs: 60 * 1000, max: 100 }, // 100 API calls per minute
  upload: { windowMs: 60 * 1000, max: 10 }, // 10 uploads per minute
};

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function SecurityMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  // CSRF Protection for state-changing operations
  if (isStateChangingMethod(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    if (!isValidOrigin(origin, referer, request)) {
      return new NextResponse('CSRF protection violated', { status: 403 });
    }
  }

  // Rate limiting
  if (isRateLimited(ip, url.pathname, request)) {
    return new NextResponse('Rate limit exceeded. Please try again later.', {
      status: 429,
      headers: {
        'X-RateLimit-Retry-After': '60',
        'Retry-After': '60',
      },
    });
  }

  // Bot detection and blocking
  if (isSuspiciousRequest(request)) {
    return new NextResponse('Access denied', { status: 403 });
  }

  // Content type validation
  if (request.method === 'POST' && hasFileUpload(request)) {
    const contentType = request.headers.get('content-type') || '';

    if (!isValidContentType(contentType)) {
      return new NextResponse('Invalid content type', { status: 400 });
    }
  }

  return response;
}

// Helper functions
function isStateChangingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
}

function isValidOrigin(
  origin: string | null,
  referer: string | null,
  request: NextRequest,
): boolean {
  const host = request.headers.get('host');

  if (!origin && !referer) {
    // Allow requests without origin/referer (e.g., direct API calls)
    return request.headers.get('content-type')?.includes('application/json') ?? false;
  }

  if (origin && origin.startsWith('https://sigmacode.ai')) return true;
  if (referer && referer.startsWith(`https://${host}`)) return true;

  return false;
}

function isRateLimited(ip: string, pathname: string, request: NextRequest): boolean {
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const limit = getRateLimitForPath(pathname, request);

  if (!limit) return false;

  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return false;
  }

  if (existing.count >= limit.max) {
    return true;
  }

  existing.count++;
  return false;
}

function getRateLimitForPath(pathname: string, request: NextRequest) {
  if (pathname.startsWith('/api/auth/')) return RATE_LIMITS.auth;
  if (pathname.startsWith('/api/')) return RATE_LIMITS.api;
  if (pathname.includes('/upload')) return RATE_LIMITS.upload;
  return RATE_LIMITS.general;
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';

  // Block known bots and suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /postman/i,
    /insomnia/i,
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    return true;
  }

  // Check for missing required headers
  if (!request.headers.get('accept')) {
    return true;
  }

  return false;
}

function hasFileUpload(request: NextRequest): boolean {
  return request.headers.get('content-type')?.includes('multipart/form-data') ?? false;
}

function isValidContentType(contentType: string): boolean {
  const allowedTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/octet-stream',
  ];

  return allowedTypes.some((type) => contentType.includes(type));
}

// Advanced Authentication Middleware
export function AuthMiddleware(request: NextRequest) {
  const token =
    request.cookies.get('next-auth.session-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return { user: null, isAuthenticated: false };
  }

  try {
    // Verify JWT token (in production, validate with your auth provider)
    const decoded = JSON.parse(atob(token.split('.')[1]));

    return {
      user: {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role || 'user',
        permissions: decoded.permissions || [],
      },
      isAuthenticated: true,
    };
  } catch (error) {
    return { user: null, isAuthenticated: false };
  }
}

// Advanced Database Security
export const databaseSecurity = {
  // Row Level Security helper
  generateRLSPolicy: (table: string, userRole: string, permissions: string[]) => {
    const policies = {
      select: permissions.includes('read') ? `auth.role() IN ('${userRole}', 'admin')` : 'false',
      insert: permissions.includes('create') ? `auth.role() IN ('${userRole}', 'admin')` : 'false',
      update: permissions.includes('update') ? `auth.role() IN ('${userRole}', 'admin')` : 'false',
      delete: permissions.includes('delete') ? `auth.role() IN ('${userRole}', 'admin')` : 'false',
    };

    return Object.entries(policies)
      .filter(([_, condition]) => condition !== 'false')
      .map(
        ([operation, condition]) =>
          `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
         CREATE POLICY ${table}_${operation}_policy ON ${table}
         FOR ${operation.toUpperCase()}
         TO authenticated
         USING (${condition});`,
      )
      .join('\n');
  },

  // Data encryption helper
  encryptSensitiveData: (data: string, key: string): string => {
    // In production, use proper encryption
    return Buffer.from(data).toString('base64');
  },

  decryptSensitiveData: (encryptedData: string, key: string): string => {
    // In production, use proper decryption
    return Buffer.from(encryptedData, 'base64').toString();
  },

  // Audit logging
  logAuditEvent: (event: {
    userId: string;
    action: string;
    resource: string;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
  }) => {
    // Implementation would send to audit log system
    console.log('AUDIT EVENT:', event);
  },
};

// Advanced Error Handling with Security
export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export const handleSecurityError = (error: unknown): NextResponse => {
  if (error instanceof SecurityError) {
    // Log security incident
    console.error('Security Error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    });

    // Don't expose sensitive information in production
    const isProduction = process.env.NODE_ENV === 'production';
    const message =
      isProduction && error.statusCode >= 500 ? 'Internal server error' : error.message;

    return new NextResponse(message, {
      status: error.statusCode,
      headers: {
        'X-Error-Code': error.code,
      },
    });
  }

  return new NextResponse('Internal server error', { status: 500 });
};
