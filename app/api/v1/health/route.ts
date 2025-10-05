import { NextResponse } from 'next/server';
import { getDb } from '@/database/db';
import { settings } from '@/database/schema/settings';
import { eq } from 'drizzle-orm';

// Structured API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  version: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  checks: {
    database: boolean;
    settings: boolean;
  };
  timestamp: string;
  uptime: number;
}

// Custom error class for API errors (moved inside function to avoid export issues)
class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    const db = await getDb();
    let databaseOk = false;
    let settingsOk = false;

    // Database connectivity check
    try {
      await db.execute('SELECT 1');
      databaseOk = true;
    } catch (error) {
      throw new ApiException('DATABASE_UNAVAILABLE', 'Database connection failed', 503, {
        error: error instanceof Error ? error.message : 'Unknown database error',
      });
    }

    // Settings table check
    try {
      const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'health_check'))
        .limit(1);

      settingsOk = true;
      const settingsValue = rows?.[0]?.value ?? 'not_configured';
    } catch (error) {
      // Settings table might not be accessible, but DB is OK
      settingsOk = false;
    }

    const uptime = process.uptime();
    const status: 'ok' | 'degraded' | 'error' = databaseOk
      ? settingsOk
        ? 'ok'
        : 'degraded'
      : 'error';

    const response: ApiResponse<HealthResponse> = {
      success: true,
      data: {
        status,
        checks: {
          database: databaseOk,
          settings: settingsOk,
        },
        timestamp: new Date().toISOString(),
        uptime,
      },
      timestamp: new Date().toISOString(),
      version: 'v1',
    };

    return NextResponse.json(response, {
      status: status === 'ok' ? 200 : status === 'degraded' ? 200 : 503,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof ApiException) {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
        version: 'v1',
      };

      return NextResponse.json(errorResponse, { status: error.statusCode });
    }

    // Fallback für unbekannte Fehler
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      timestamp: new Date().toISOString(),
      version: 'v1',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
