import { NextRequest, NextResponse } from 'next/server';
import { ssoService } from '@/lib/sso-service';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

const CreateSSOConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['saml', 'oauth2', 'oidc']),
  config: z.record(z.any()),
});

// POST /api/sso/auth-url - Generate SSO authorization URL
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const { providerId, returnUrl } = body as { providerId?: string; returnUrl?: string };

    if (!providerId) {
      return NextResponse.json({ error: 'providerId is required' }, { status: 400 });
    }

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    // Get SSO config
    const configs = await ssoService.getSSOConfigs(tenantId);
    const config = configs.find((c) => c.id === providerId);

    if (!config) {
      return NextResponse.json({ error: 'SSO configuration not found' }, { status: 404 });
    }

    if (!config.enabled) {
      return NextResponse.json({ error: 'SSO provider is disabled' }, { status: 400 });
    }

    let authUrl: string;
    let state: string;

    if (config.type === 'saml') {
      const result = await ssoService.generateSAMLRequest(config);
      authUrl = result.redirectUrl;
      state = result.requestId;
    } else {
      const result = await ssoService.generateOAuth2AuthUrl(config);
      authUrl = result.authUrl;
      state = result.state;
    }

    return NextResponse.json({
      success: true,
      authUrl,
      state,
      provider: {
        id: config.id,
        name: config.name,
        type: config.type,
      },
    });
  } catch (error: unknown) {
    const requestId = request.headers.get('x-request-id') || 'unknown';
    Sentry.withScope((scope) => {
      scope.setTag('route', 'POST /api/sso/auth-url');
      scope.setTag('feature', 'sso');
      scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
    console.error('Generate SSO auth URL error:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    res.headers.set('x-request-id', requestId);
    return res;
  }
}

// GET /api/sso/callback - Handle SSO callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const samlResponse = searchParams.get('SAMLResponse');

    if (!state) {
      return NextResponse.json({ error: 'Missing state parameter' }, { status: 400 });
    }

    const tenantId = request.headers.get('x-tenant-id') || 'default';
    const configs = await ssoService.getSSOConfigs(tenantId);
    const config = configs.find((c) => c.enabled);

    if (!config) {
      return NextResponse.json({ error: 'No SSO configuration found' }, { status: 404 });
    }

    let session;

    if (samlResponse) {
      // SAML callback
      session = await ssoService.processSAMLResponse(config, samlResponse);
    } else if (code) {
      // OAuth2 callback
      session = await ssoService.processOAuth2Callback(config, code, state);
    } else {
      return NextResponse.json(
        { error: 'Missing authorization code or SAML response' },
        { status: 400 },
      );
    }

    // Generate JWT token for the session
    const token = await generateSessionToken(session);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/sso/callback?token=${token}&state=${state}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error: unknown) {
    const requestId = request.headers.get('x-request-id') || 'unknown';
    Sentry.withScope((scope) => {
      scope.setTag('route', 'GET /api/sso/callback');
      scope.setTag('feature', 'sso');
      scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
    console.error('SSO callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent('SSO authentication failed')}`;
    const res = NextResponse.redirect(errorUrl);
    res.headers.set('x-request-id', requestId);
    return res;
  }
}

// Helper function to generate session token
async function generateSessionToken(session: any): Promise<string> {
  // Implementation would generate JWT token
  // For now, return a simple token
  return `sso_token_${session.id}_${Date.now()}`;
}

// POST /api/sso/config - Create SSO configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateSSOConfigSchema.parse(body);

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'x-tenant-id header is required' }, { status: 400 });
    }

    const config = await ssoService.createSSOConfig({
      tenantId,
      name: validatedData.name,
      type: validatedData.type,
      enabled: true,
      config: validatedData.config,
    });

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        tenantId: config.tenantId,
        name: config.name,
        type: config.type,
        enabled: config.enabled,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    const requestId = request.headers.get('x-request-id') || 'unknown';
    Sentry.withScope((scope) => {
      scope.setTag('route', 'PUT /api/sso/config');
      scope.setTag('feature', 'sso');
      scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
    console.error('Create SSO config error:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    res.headers.set('x-request-id', requestId);
    return res;
  }
}
