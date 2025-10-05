// SIGMACODE SSO Service
// Support for SAML and OAuth2 authentication

import { getDb } from '@/database/db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// SSO Provider Types
export type SSOProviderType = 'saml' | 'oauth2' | 'oidc';

// SSO Configuration
export interface SSOConfig {
  id: string;
  tenantId: string;
  name: string;
  type: SSOProviderType;
  enabled: boolean;
  config: {
    // SAML
    samlEntityId?: string;
    samlSSOUrl?: string;
    samlCertificate?: string;
    samlPrivateKey?: string;
    samlSignRequests?: boolean;
    samlSignResponses?: boolean;

    // OAuth2/OIDC
    oauth2AuthorizationUrl?: string;
    oauth2TokenUrl?: string;
    oauth2UserInfoUrl?: string;
    oauth2ClientId?: string;
    oauth2ClientSecret?: string;
    oauth2Scope?: string[];
    oauth2ResponseType?: string;
    oauth2GrantType?: string;

    // Common
    domain?: string;
    autoProvision?: boolean;
    syncGroups?: boolean;
    defaultRole?: string;
    attributeMapping?: Record<string, string>;
  };
  createdAt: Date;
  updatedAt: Date;
}

// SSO Session
export interface SSOSession {
  id: string;
  tenantId: string;
  providerId: string;
  userId?: string;
  externalUserId: string;
  email: string;
  name?: string;
  groups?: string[];
  attributes: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
}

// SAML Response
export interface SAMLResponse {
  issuer: string;
  nameId: string;
  nameIdFormat: string;
  sessionIndex: string;
  attributes: Record<string, any>;
  groups?: string[];
}

// OAuth2 Token Response
export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

// OAuth2 User Info
export interface OAuth2UserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  groups?: string[];
}

export class SSOService {
  private static instance: SSOService;
  private sessions: Map<string, SSOSession> = new Map();

  static getInstance(): SSOService {
    if (!SSOService.instance) {
      SSOService.instance = new SSOService();
    }
    return SSOService.instance;
  }

  // Generate SAML authentication request
  async generateSAMLRequest(
    config: SSOConfig,
  ): Promise<{ redirectUrl: string; requestId: string }> {
    if (config.type !== 'saml') {
      throw new Error('Provider is not SAML type');
    }

    const requestId = uuidv4();
    const samlConfig = config.config;

    // Generate SAML AuthnRequest
    const authnRequest = this.generateSAMLAuthnRequest({
      issuer: process.env.APP_URL || 'http://localhost:3000',
      destination: samlConfig.samlSSOUrl!,
      providerName: config.name,
    });

    // Store request state
    const session: SSOSession = {
      id: requestId,
      tenantId: config.tenantId,
      providerId: config.id,
      externalUserId: '',
      email: '',
      attributes: {},
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };

    this.sessions.set(requestId, session);

    // Return redirect URL with SAML request
    const redirectUrl = `${samlConfig.samlSSOUrl}?SAMLRequest=${encodeURIComponent(authnRequest)}`;

    return { redirectUrl, requestId };
  }

  // Process SAML response
  async processSAMLResponse(config: SSOConfig, samlResponse: string): Promise<SSOSession> {
    if (config.type !== 'saml') {
      throw new Error('Provider is not SAML type');
    }

    // Parse and validate SAML response
    const parsedResponse = await this.parseSAMLResponse(samlResponse, config);

    // Create or update session
    const sessionId = uuidv4();
    const session: SSOSession = {
      id: sessionId,
      tenantId: config.tenantId,
      providerId: config.id,
      externalUserId: parsedResponse.nameId,
      email: parsedResponse.attributes.email || parsedResponse.attributes.mail || '',
      name: parsedResponse.attributes.displayName || parsedResponse.attributes.name || '',
      groups: parsedResponse.groups || [],
      attributes: parsedResponse.attributes,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    // Auto-provision user if enabled
    if (config.config.autoProvision) {
      await this.provisionUser(session);
    }

    return session;
  }

  // Generate OAuth2 authorization URL
  async generateOAuth2AuthUrl(config: SSOConfig): Promise<{ authUrl: string; state: string }> {
    if (config.type !== 'oauth2' && config.type !== 'oidc') {
      throw new Error('Provider is not OAuth2/OIDC type');
    }

    const state = uuidv4();
    const oauth2Config = config.config;

    const params = new URLSearchParams({
      client_id: oauth2Config.oauth2ClientId!,
      response_type: oauth2Config.oauth2ResponseType || 'code',
      scope: (oauth2Config.oauth2Scope || ['openid', 'email', 'profile']).join(' '),
      redirect_uri: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/sso/callback`,
      state,
    });

    const authUrl = `${oauth2Config.oauth2AuthorizationUrl}?${params.toString()}`;

    // Store state for verification
    const session: SSOSession = {
      id: state,
      tenantId: config.tenantId,
      providerId: config.id,
      externalUserId: '',
      email: '',
      attributes: {},
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
    };

    this.sessions.set(state, session);

    return { authUrl, state };
  }

  // Process OAuth2 callback
  async processOAuth2Callback(config: SSOConfig, code: string, state: string): Promise<SSOSession> {
    if (config.type !== 'oauth2' && config.type !== 'oidc') {
      throw new Error('Provider is not OAuth2/OIDC type');
    }

    // Verify state
    const session = this.sessions.get(state);
    if (!session || session.providerId !== config.id) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for tokens
    const tokenResponse = await this.exchangeOAuth2Code(config, code);

    // Get user info
    const userInfo = await this.getOAuth2UserInfo(config, tokenResponse);

    // Update session
    const updatedSession: SSOSession = {
      ...session,
      externalUserId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.given_name + ' ' + userInfo.family_name,
      groups: userInfo.groups || [],
      attributes: {
        ...userInfo,
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_in: tokenResponse.expires_in,
        refresh_token: tokenResponse.refresh_token,
      },
      expiresAt: new Date(Date.now() + (tokenResponse.expires_in || 3600) * 1000),
    };

    this.sessions.set(state, updatedSession);

    // Auto-provision user if enabled
    if (config.config.autoProvision) {
      await this.provisionUser(updatedSession);
    }

    return updatedSession;
  }

  // Provision user in system
  private async provisionUser(session: SSOSession) {
    // Implementation would create/update user in database
    // For now, just log the provisioning
    console.log('Provisioning user:', {
      tenantId: session.tenantId,
      email: session.email,
      name: session.name,
      groups: session.groups,
    });

    // In production, this would:
    // 1. Create user record if not exists
    // 2. Update user attributes
    // 3. Assign roles based on groups
    // 4. Create audit log entry
  }

  // Generate SAML AuthnRequest
  private generateSAMLAuthnRequest(params: {
    issuer: string;
    destination: string;
    providerName: string;
  }): string {
    const { issuer, destination, providerName } = params;

    // This is a simplified SAML request generation
    // In production, use a proper SAML library like @node-saml/node-saml
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const samlRequest = `
      <samlp:AuthnRequest
        xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${requestId}"
        Version="2.0"
        IssueInstant="${timestamp}"
        Destination="${destination}"
        AssertionConsumerServiceURL="${issuer}/api/auth/sso/callback">
        <saml:Issuer>${issuer}</saml:Issuer>
        <samlp:NameIDPolicy
          Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
          AllowCreate="true"/>
      </samlp:AuthnRequest>
    `.trim();

    // Base64 encode and URL encode
    return Buffer.from(samlRequest).toString('base64');
  }

  // Parse SAML response
  private async parseSAMLResponse(samlResponse: string, config: SSOConfig): Promise<SAMLResponse> {
    // This is a simplified SAML response parsing
    // In production, use a proper SAML library

    // For demo purposes, return mock data
    return {
      issuer: 'mock-saml-provider',
      nameId: 'user@example.com',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      sessionIndex: uuidv4(),
      attributes: {
        email: 'user@example.com',
        displayName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        groups: ['users', 'developers'],
      },
      groups: ['users', 'developers'],
    };
  }

  // Exchange OAuth2 code for tokens
  private async exchangeOAuth2Code(config: SSOConfig, code: string): Promise<OAuth2TokenResponse> {
    const oauth2Config = config.config;

    const response = await fetch(oauth2Config.oauth2TokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${oauth2Config.oauth2ClientId}:${oauth2Config.oauth2ClientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: oauth2Config.oauth2GrantType || 'authorization_code',
        code,
        redirect_uri: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/sso/callback`,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`OAuth2 token exchange failed: ${response.status}`);
    }

    return await response.json();
  }

  // Get OAuth2 user info
  private async getOAuth2UserInfo(
    config: SSOConfig,
    tokenResponse: OAuth2TokenResponse,
  ): Promise<OAuth2UserInfo> {
    const oauth2Config = config.config;

    const response = await fetch(oauth2Config.oauth2UserInfoUrl!, {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`OAuth2 user info fetch failed: ${response.status}`);
    }

    return await response.json();
  }

  // Get SSO session
  async getSession(sessionId: string): Promise<SSOSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  // Create SSO configuration
  async createSSOConfig(config: Omit<SSOConfig, 'id' | 'createdAt' | 'updatedAt'>) {
    // Implementation would store in database
    return {
      ...config,
      id: `sso_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Get SSO configurations for tenant
  async getSSOConfigs(tenantId: string): Promise<SSOConfig[]> {
    // Implementation would query database
    return [];
  }

  // Get enabled SSO providers for domain
  async getSSOProvidersForDomain(domain: string): Promise<SSOConfig[]> {
    // Implementation would query database
    return [];
  }
}

export const ssoService = SSOService.getInstance();
