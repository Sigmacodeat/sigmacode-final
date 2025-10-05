import { NextRequest, NextResponse } from 'next/server';
import { getRedisCache } from '../../../../lib/cache/redis-v2';
import { getServerAuthSession } from '@/lib/auth';
import { z } from 'zod';

interface FirewallConfig {
  enabled: boolean;
  mode: 'enforce' | 'shadow' | 'off';
  defaultPolicy: 'strict' | 'balanced' | 'permissive';
  sampling: number;
  failOpen: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  redactionToken: string;
  circuitBreakerEnabled: boolean;
  retryAttempts: number;
  cacheEnabled: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Require authenticated session
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const redis = getRedisCache();

    // Get config from Redis cache
    const configKey = 'firewall:config';
    const cachedConfig = await redis.get<FirewallConfig>(configKey);

    if (cachedConfig) {
      return NextResponse.json({ config: cachedConfig });
    }

    // Default configuration
    const defaultConfig: FirewallConfig = {
      enabled: process.env.FIREWALL_ENABLED === 'true',
      mode: (process.env.FIREWALL_MODE as 'enforce' | 'shadow' | 'off') || 'enforce',
      defaultPolicy: 'balanced',
      sampling: 1.0,
      failOpen: false,
      logLevel: 'info',
      redactionToken: '[REDACTED]',
      circuitBreakerEnabled: true,
      retryAttempts: 3,
      cacheEnabled: true,
    };

    // Cache config for 5 minutes
    await redis.set(configKey, defaultConfig, 300);

    return NextResponse.json({ config: defaultConfig });
  } catch (error) {
    console.error('Failed to fetch firewall config:', error);
    return NextResponse.json({ error: 'Failed to fetch firewall config' }, { status: 500 });
  }
}

// Validation schema for partial updates
const FirewallConfigSchema = z.object({
  enabled: z.boolean().optional(),
  mode: z.enum(['enforce', 'shadow', 'off']).optional(),
  defaultPolicy: z.enum(['strict', 'balanced', 'permissive']).optional(),
  sampling: z.number().min(0).max(1).optional(),
  failOpen: z.boolean().optional(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  redactionToken: z.string().min(1).optional(),
  circuitBreakerEnabled: z.boolean().optional(),
  retryAttempts: z.number().min(0).max(10).optional(),
  cacheEnabled: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Admin RBAC
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const roles: string[] | undefined = (session.user as any)?.roles;
    if (!Array.isArray(roles) || !roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
    }
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const parsed = FirewallConfigSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const config: Partial<FirewallConfig> = parsed.data as Partial<FirewallConfig>;

    const redis = getRedisCache();

    // Get existing config
    const configKey = 'firewall:config';
    const existingConfig = (await redis.get<FirewallConfig>(configKey)) || {
      enabled: process.env.FIREWALL_ENABLED === 'true',
      mode: (process.env.FIREWALL_MODE as 'enforce' | 'shadow' | 'off') || 'enforce',
      defaultPolicy: 'balanced',
      sampling: 1.0,
      failOpen: false,
      logLevel: 'info',
      redactionToken: '[REDACTED]',
      circuitBreakerEnabled: true,
      retryAttempts: 3,
      cacheEnabled: true,
    };

    // Update with new values
    const updatedConfig = { ...existingConfig, ...config };

    // Cache updated config for 5 minutes
    await redis.set(configKey, updatedConfig, 300);

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: 'Firewall configuration updated successfully',
    });
  } catch (error) {
    console.error('Failed to update firewall config:', error);
    return NextResponse.json({ error: 'Failed to update firewall config' }, { status: 500 });
  }
}
