// SIGMACODE AI - Security Hardening & Protection Middleware
// Production-grade security measures for Next.js applications

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Extend globalThis type to include rate limit store
declare global {
  var __rateLimitStore: Map<string, number> | undefined;
}

// Security Configuration Interface
export interface SecurityConfig {
  // Content Security Policy
  contentSecurityPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };

  // CORS Configuration
  cors: {
    enabled: boolean;
    origin: string | string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };

  // Security Headers
  securityHeaders: {
    hsts: boolean;
    hstsMaxAge: number;
    hstsPreload: boolean;
    noSniff: boolean;
    xssProtection: boolean;
    frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    frameOptionsUrl?: string;
    referrerPolicy:
      | 'no-referrer'
      | 'no-referrer-when-downgrade'
      | 'origin'
      | 'origin-when-cross-origin'
      | 'same-origin'
      | 'strict-origin'
      | 'strict-origin-when-cross-origin'
      | 'unsafe-url';
  };

  // Input Validation
  inputValidation: {
    sanitizeInput: boolean;
    maxBodySize: number;
    maxQueryParams: number;
    allowedFileTypes: string[];
  };

  // Rate Limiting Integration
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    blockDurationMs: number;
  };
}

// Default Security Configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  contentSecurityPolicy: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", 'https:'],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
    },
  },
  cors: {
    enabled: true,
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://sigmacode.ai', 'https://www.sigmacode.ai']
        : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
  },
  securityHeaders: {
    hsts: true,
    hstsMaxAge: 31536000, // 1 year
    hstsPreload: true,
    noSniff: true,
    xssProtection: true,
    frameOptions: 'DENY',
    referrerPolicy: 'strict-origin-when-cross-origin',
  },
  inputValidation: {
    sanitizeInput: true,
    maxBodySize: 10 * 1024 * 1024, // 10MB
    maxQueryParams: 100,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  },
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 60,
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
};

// Security Middleware Class
export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private config: SecurityConfig;

  private constructor(config: Partial<SecurityConfig> = {}) {
    this.config = this.deepMerge(DEFAULT_SECURITY_CONFIG, config);
  }

  static getInstance(config?: Partial<SecurityConfig>): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware(config);
    }
    return SecurityMiddleware.instance;
  }

  // Main security middleware function
  async applySecurity(request: NextRequest): Promise<NextResponse> {
    // Input validation and sanitization
    const validationResult = this.validateInput(request);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.errors },
        { status: 400 },
      );
    }

    // Apply CORS headers
    if (this.config.cors.enabled) {
      const corsResult = this.handleCORS(request);
      if (corsResult) {
        return corsResult;
      }
    }

    // Create response with security headers
    const response = NextResponse.next();

    // Apply Content Security Policy
    if (this.config.contentSecurityPolicy.enabled) {
      this.applyCSP(response);
    }

    // Apply security headers
    this.applySecurityHeaders(response);

    // Apply rate limiting if enabled
    if (this.config.rateLimiting.enabled) {
      const rateLimitResult = await this.applyRateLimiting(request);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
          { status: 429 },
        );
      }
    }

    return response;
  }

  // Input validation and sanitization
  private validateInput(request: NextRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check body size
    if (request.body) {
      const contentLength = parseInt(request.headers.get('content-length') || '0');
      if (contentLength > this.config.inputValidation.maxBodySize) {
        errors.push('Request body too large');
      }
    }

    // Check query parameters count
    const url = new URL(request.url);
    if (url.searchParams.toString().length > 4096) {
      errors.push('Too many query parameters');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /eval\s*\(/i];

    const body = request.body?.toString() || '';
    const query = url.searchParams.toString();

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(body) || pattern.test(query)) {
        errors.push('Suspicious content detected');
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // CORS handling
  private handleCORS(request: NextRequest): NextResponse | null {
    const origin = request.headers.get('origin');
    const method = request.method;

    // Handle preflight requests
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });

      if (this.isOriginAllowed(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin || '*');
        response.headers.set('Access-Control-Allow-Methods', this.config.cors.methods.join(', '));
        response.headers.set(
          'Access-Control-Allow-Headers',
          this.config.cors.allowedHeaders.join(', '),
        );
        response.headers.set(
          'Access-Control-Allow-Credentials',
          this.config.cors.credentials.toString(),
        );
        response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
      }

      return response;
    }

    return null;
  }

  private isOriginAllowed(origin: string | null): boolean {
    if (!origin) return true;

    const allowedOrigins = Array.isArray(this.config.cors.origin)
      ? this.config.cors.origin
      : [this.config.cors.origin];

    return allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  }

  // Apply Content Security Policy
  private applyCSP(response: NextResponse): void {
    const directives = this.config.contentSecurityPolicy.directives;
    const cspParts: string[] = [];

    for (const [directive, values] of Object.entries(directives)) {
      cspParts.push(`${directive} ${values.join(' ')}`);
    }

    response.headers.set('Content-Security-Policy', cspParts.join('; '));
  }

  // Apply security headers
  private applySecurityHeaders(response: NextResponse): void {
    const headers = this.config.securityHeaders;

    // HSTS (HTTP Strict Transport Security)
    if (headers.hsts) {
      let hstsValue = `max-age=${headers.hstsMaxAge}`;
      if (headers.hstsPreload) {
        hstsValue += '; preload';
      }
      response.headers.set('Strict-Transport-Security', hstsValue);
    }

    // X-Content-Type-Options
    if (headers.noSniff) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // X-XSS-Protection
    if (headers.xssProtection) {
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }

    // X-Frame-Options
    response.headers.set('X-Frame-Options', headers.frameOptions);
    if (headers.frameOptions === 'ALLOW-FROM' && headers.frameOptionsUrl) {
      response.headers.set('X-Frame-Options', `ALLOW-FROM ${headers.frameOptionsUrl}`);
    }

    // Referrer-Policy
    response.headers.set('Referrer-Policy', headers.referrerPolicy);

    // Additional security headers
    response.headers.set('X-Powered-By', 'SIGMACODE-AI');
    response.headers.set('X-Content-Security-Policy', "default-src 'self'");
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  // Simple rate limiting (in production, use the dedicated rate limiter)
  private async applyRateLimiting(
    request: NextRequest,
  ): Promise<{ allowed: boolean; retryAfter: number }> {
    const clientIP = this.getClientIP(request);
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const key = `security_ratelimit:${clientIP}`;

    // Simple in-memory rate limiting (replace with Redis in production)
    const requests = this.getRequestsInWindow(key, now, windowMs);

    if (requests.length >= this.config.rateLimiting.maxRequestsPerMinute) {
      return {
        allowed: false,
        retryAfter: Math.ceil(windowMs / 1000),
      };
    }

    this.addRequestToWindow(key, now);

    return {
      allowed: true,
      retryAfter: 0,
    };
  }

  // Helper methods
  private getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (cfConnectingIP) return cfConnectingIP.split(',')[0].trim();
    if (forwardedFor) return forwardedFor.split(',')[0].trim();
    if (realIP) return realIP.trim();

    return '127.0.0.1';
  }

  private getRequestsInWindow(key: string, now: number, windowMs: number): number[] {
    const requests: number[] = [];
    const windowStart = now - windowMs;

    // Simple in-memory implementation
    for (let i = 0; i < 100; i++) {
      const timestamp = globalThis.__rateLimitStore?.get(`${key}:${i}`);
      if (timestamp && timestamp >= windowStart) {
        requests.push(timestamp);
      }
    }

    return requests;
  }

  private addRequestToWindow(key: string, timestamp: number): void {
    if (!globalThis.__rateLimitStore) {
      globalThis.__rateLimitStore = new Map();
    }

    const existingRequests = this.getRequestsInWindow(key, Date.now(), 60000);
    const newIndex = existingRequests.length;
    globalThis.__rateLimitStore.set(`${key}:${newIndex}`, timestamp);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  // Update configuration
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = this.deepMerge(this.config, newConfig);
  }

  // Get current configuration
  getConfig(): SecurityConfig {
    return JSON.parse(JSON.stringify(this.config));
  }
}

// Middleware wrapper for Next.js API routes
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: Partial<SecurityConfig>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const securityMiddleware = SecurityMiddleware.getInstance(options);

    try {
      return await securityMiddleware.applySecurity(request);
    } catch (error) {
      console.error('Security middleware error:', error);

      // Return 500 error with security headers
      const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });

      // Apply basic security headers even on error
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      return response;
    }
  };
}

// Input sanitization utility
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .trim();
}

// SQL injection protection
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/['"`;\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, '')
    .trim();
}

// Export singleton instance
export const securityMiddleware = SecurityMiddleware.getInstance();
