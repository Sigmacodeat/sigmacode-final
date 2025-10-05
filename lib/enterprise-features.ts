// Enterprise Features for SIGMACODE AI Firewall
// SSO, Multi-Tenant, RBAC, and SLA Management
import {
  AggregatedMetric,
  CreateRoleRequest,
  CreateSLARequest,
  CreateTenantRequest,
  OAuth2Config,
  OIDCConfig,
  Permission,
  Role,
  SAMLConfig,
  SLA,
  SLACompliance,
  SLAMetric,
  SLAReport,
  SLAReportSummary,
  SLAViolation,
  SSOCallback,
  SSOProvider,
  SSOProviderConfig,
  SSORequest,
  SSOResponse,
  SSOSession,
  SSOToken,
  SSOUserInfo,
  Tenant,
  TenantPlan,
  TenantQuotas,
} from './compliance-audit';

// SSO (Single Sign-On) Implementation
export class SSOService {
  private static instance: SSOService;
  private providers: Map<string, SSOProvider> = new Map();
  private sessions: Map<string, SSOSession> = new Map();

  static getInstance(): SSOService {
    if (!SSOService.instance) {
      SSOService.instance = new SSOService();
    }
    return SSOService.instance;
  }

  async initialize(configs: SSOProviderConfig[]): Promise<void> {
    for (const config of configs) {
      let provider: SSOProvider;

      switch (config.type) {
        case 'saml':
          provider = new SAMLProvider(config.config as SAMLConfig);
          break;
        case 'oauth2':
          provider = new OAuth2Provider(config.config as OAuth2Config);
          break;
        case 'oidc':
          provider = new OIDCProvider(config.config as OIDCConfig);
          break;
        default:
          throw new Error(`Unsupported SSO provider: ${config.type}`);
      }

      this.providers.set(config.name, provider);
    }

    console.log('SSO Service initialized with providers:', Array.from(this.providers.keys()));
  }

  async initiateSSO(providerName: string, request: SSORequest): Promise<SSOResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`SSO provider not found: ${providerName}`);
    }

    const sessionId = `sso_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: SSOSession = {
      id: sessionId,
      providerName,
      state: 'initiated',
      request,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    };

    this.sessions.set(sessionId, session);

    const authUrl = await provider.generateAuthUrl(session);

    return {
      sessionId,
      authUrl,
      expiresIn: 600, // 10 minutes
    };
  }

  async handleCallback(providerName: string, callbackData: SSOCallback): Promise<SSOToken> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`SSO provider not found: ${providerName}`);
    }

    const session = this.sessions.get(callbackData.state);
    if (!session) {
      throw new Error('Invalid SSO session');
    }

    if (session.state !== 'initiated') {
      throw new Error('SSO session already processed');
    }

    const userInfo = await provider.exchangeCode(callbackData);

    session.state = 'completed';
    session.userInfo = userInfo;
    session.completedAt = new Date().toISOString();

    const token = await this.generateSSOToken(userInfo, providerName);

    return token;
  }

  private async generateSSOToken(userInfo: SSOUserInfo, providerName: string): Promise<SSOToken> {
    const tokenId = `sso_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In production, use proper JWT library
    const token = Buffer.from(
      JSON.stringify({
        id: tokenId,
        userId: userInfo.id,
        provider: providerName,
        roles: userInfo.roles,
        permissions: userInfo.permissions,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }),
    ).toString('base64');

    return {
      accessToken: token,
      refreshToken: `refresh_${tokenId}`,
      expiresIn: 86400, // 24 hours
      tokenType: 'Bearer',
      userInfo,
    };
  }

  async validateToken(token: string): Promise<SSOToken | null> {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

      if (decoded.expiresAt < Date.now()) {
        return null;
      }

      // Get user info from provider
      const provider = this.providers.get(decoded.provider);
      if (!provider) {
        return null;
      }

      const userInfo = await provider.getUserInfo(decoded.userId);

      return {
        accessToken: token,
        refreshToken: `refresh_${decoded.id}`,
        expiresIn: Math.floor((decoded.expiresAt - Date.now()) / 1000),
        tokenType: 'Bearer',
        userInfo,
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<SSOToken | null> {
    try {
      const tokenId = refreshToken.replace('refresh_', '');
      const session = Array.from(this.sessions.values()).find(
        (s) => s.id === tokenId && s.state === 'completed',
      );

      if (!session) {
        return null;
      }

      if (!session.userInfo) {
        return null;
      }

      const provider = this.providers.get(session.providerName);
      if (!provider) {
        return null;
      }

      // Check if refresh is still valid
      if (new Date(session.expiresAt) < new Date()) {
        return null;
      }

      return this.generateSSOToken(session.userInfo, session.providerName);
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }
}

// SSO Provider Implementations

export class SAMLProvider implements SSOProvider {
  public readonly name: string;
  public readonly type: 'saml' = 'saml';

  constructor(private config: SAMLConfig) {
    this.name = 'saml';
  }

  async generateAuthUrl(session: SSOSession): Promise<string> {
    // SAML authentication URL generation
    const params = new URLSearchParams({
      SAMLRequest: Buffer.from(
        JSON.stringify({
          issuer: this.config.issuer,
          assertionConsumerServiceURL: this.config.redirectUri,
          protocolBinding: 'HTTP-POST',
          nameIdPolicy: 'persistent',
          requestedAuthnContext: {
            comparison: 'exact',
            authnContextClassRef:
              'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
          },
        }),
      ).toString('base64'),
      RelayState: session.request.state,
    });

    return `${this.config.entryPoint}?${params.toString()}`;
  }

  async exchangeCode(callbackData: SSOCallback): Promise<SSOUserInfo> {
    // SAML assertion processing (simplified)
    if (callbackData.error) {
      throw new Error(`SAML authentication failed: ${callbackData.error}`);
    }

    // In a real implementation, you would validate the SAML assertion
    // For now, return mock user info
    return {
      id: `saml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: 'user@saml-provider.com',
      name: 'SAML User',
      roles: ['user'],
      permissions: ['basic'],
      groups: [],
      metadata: {
        provider: 'saml',
        issuer: this.config.issuer,
      },
    };
  }

  async getUserInfo(userId: string): Promise<SSOUserInfo> {
    // Return cached user info or fetch from SAML IdP
    return {
      id: userId,
      email: 'user@saml-provider.com',
      name: 'SAML User',
      roles: ['user'],
      permissions: ['basic'],
      groups: [],
      metadata: {
        provider: 'saml',
        issuer: this.config.issuer,
      },
    };
  }
}

export class OAuth2Provider implements SSOProvider {
  public readonly name: string;
  public readonly type: 'oauth2' = 'oauth2';

  constructor(private config: OAuth2Config) {
    this.name = 'oauth2';
  }

  async generateAuthUrl(session: SSOSession): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: this.config.responseType,
      scope: this.config.scope,
      state: session.request.state,
    });

    return `${this.config.authorizationEndpoint}?${params.toString()}`;
  }

  async exchangeCode(callbackData: SSOCallback): Promise<SSOUserInfo> {
    if (callbackData.error) {
      throw new Error(`OAuth2 authentication failed: ${callbackData.error}`);
    }

    // Exchange code for token
    const tokenResponse = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: callbackData.code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenDataRaw = await tokenResponse.json();
    if (!tokenDataRaw || typeof tokenDataRaw !== 'object' || Array.isArray(tokenDataRaw)) {
      throw new Error('Invalid token response');
    }
    const tokenData = tokenDataRaw as { access_token?: string };
    if (!tokenData.access_token) {
      throw new Error('Missing access_token in token response');
    }

    // Get user info
    const userResponse = await fetch(this.config.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userDataRaw = await userResponse.json();
    if (!userDataRaw || typeof userDataRaw !== 'object' || Array.isArray(userDataRaw)) {
      throw new Error('Invalid user info response');
    }
    const userData = userDataRaw as {
      sub?: string;
      id?: string;
      email?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      roles?: string[];
      permissions?: string[];
      groups?: string[];
    };

    return {
      id: userData.sub || userData.id || '',
      email: userData.email ?? '',
      name: userData.name || `${userData.given_name ?? ''} ${userData.family_name ?? ''}`.trim(),
      roles: userData.roles || ['user'],
      permissions: userData.permissions || ['basic'],
      groups: userData.groups || [],
      metadata: {
        provider: 'oauth2',
        issuer: this.config.issuer,
      },
    };
  }

  async getUserInfo(userId: string): Promise<SSOUserInfo> {
    // In a real implementation, you would cache user info or make API calls
    return {
      id: userId,
      email: 'user@oauth2-provider.com',
      name: 'OAuth2 User',
      roles: ['user'],
      permissions: ['basic'],
      groups: [],
      metadata: {
        provider: 'oauth2',
        issuer: this.config.issuer,
      },
    };
  }
}

export class OIDCProvider implements SSOProvider {
  public readonly name: string;
  public readonly type: 'oidc' = 'oidc';

  constructor(private config: OIDCConfig) {
    this.name = 'oidc';
  }

  async generateAuthUrl(session: SSOSession): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: this.config.responseType,
      scope: this.config.scope,
      state: session.request.state,
      nonce: this.generateNonce(),
    });

    return `${this.config.authorizationEndpoint}?${params.toString()}`;
  }

  async exchangeCode(callbackData: SSOCallback): Promise<SSOUserInfo> {
    if (callbackData.error) {
      throw new Error(`OIDC authentication failed: ${callbackData.error}`);
    }

    // Exchange code for token
    const tokenResponse = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: callbackData.code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenDataRaw = await tokenResponse.json();
    if (!tokenDataRaw || typeof tokenDataRaw !== 'object' || Array.isArray(tokenDataRaw)) {
      throw new Error('Invalid token response');
    }
    const tokenData = tokenDataRaw as { id_token?: string; access_token?: string };
    if (!tokenData.id_token) {
      throw new Error('Missing id_token in token response');
    }

    // Decode ID token (simplified - in production use a proper JWT library)
    const idTokenParts = tokenData.id_token.split('.');
    const idTokenPayload = JSON.parse(Buffer.from(idTokenParts[1], 'base64').toString());

    // Get user info if needed
    let userInfo: any = idTokenPayload;
    if (this.config.userInfoEndpoint) {
      if (!tokenData.access_token) {
        throw new Error('Missing access_token required to fetch user info');
      }
      const userResponse = await fetch(this.config.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (userResponse.ok) {
        const extraRaw = await userResponse.json();
        if (extraRaw && typeof extraRaw === 'object' && !Array.isArray(extraRaw)) {
          userInfo = {
            ...(userInfo as Record<string, unknown>),
            ...(extraRaw as Record<string, unknown>),
          };
        }
      }
    }

    return {
      id: userInfo.sub || userInfo.id,
      email: userInfo.email,
      name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
      roles: userInfo.roles || ['user'],
      permissions: userInfo.permissions || ['basic'],
      groups: userInfo.groups || [],
      metadata: {
        provider: 'oidc',
        issuer: this.config.issuer,
        idToken: tokenData.id_token,
      },
    };
  }

  async getUserInfo(userId: string): Promise<SSOUserInfo> {
    // In a real implementation, you would cache user info or make API calls
    return {
      id: userId,
      email: 'user@oidc-provider.com',
      name: 'OIDC User',
      roles: ['user'],
      permissions: ['basic'],
      groups: [],
      metadata: {
        provider: 'oidc',
        issuer: this.config.issuer,
      },
    };
  }

  private generateNonce(): string {
    return Buffer.from(Math.random().toString()).toString('base64').substr(0, 32);
  }
}

// Multi-Tenant Management
export class MultiTenantService {
  private static instance: MultiTenantService;
  private tenants: Map<string, Tenant> = new Map();
  private tenantUsers: Map<string, string[]> = new Map(); // tenantId -> userIds

  static getInstance(): MultiTenantService {
    if (!MultiTenantService.instance) {
      MultiTenantService.instance = new MultiTenantService();
    }
    return MultiTenantService.instance;
  }

  async createTenant(tenantData: CreateTenantRequest): Promise<Tenant> {
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Ensure quotas are fully populated (no undefined numbers)
    const defaultQuotas = this.getDefaultQuotas(tenantData.plan);
    const incoming = (tenantData.quotas || {}) as Partial<TenantQuotas>;
    const quotas: TenantQuotas = {
      maxUsers: incoming.maxUsers ?? defaultQuotas.maxUsers,
      maxRequestsPerMonth: incoming.maxRequestsPerMonth ?? defaultQuotas.maxRequestsPerMonth,
      maxStorageGB: incoming.maxStorageGB ?? defaultQuotas.maxStorageGB,
      features: incoming.features ?? defaultQuotas.features,
    };

    const tenant: Tenant = {
      id: tenantId,
      name: tenantData.name,
      domain: tenantData.domain,
      plan: tenantData.plan,
      status: 'active',
      settings: tenantData.settings || {},
      quotas,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tenants.set(tenantId, tenant);
    this.tenantUsers.set(tenantId, []);

    return tenant;
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) || null;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    for (const tenant of this.tenants.values()) {
      if (tenant.domain === domain) {
        return tenant;
      }
    }
    return null;
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  async deleteTenant(tenantId: string): Promise<boolean> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    // Check if tenant has users
    const userIds = this.tenantUsers.get(tenantId) || [];
    if (userIds.length > 0) {
      throw new Error('Cannot delete tenant with active users');
    }

    this.tenants.delete(tenantId);
    this.tenantUsers.delete(tenantId);
    return true;
  }

  async addUserToTenant(userId: string, tenantId: string): Promise<boolean> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    const userIds = this.tenantUsers.get(tenantId) || [];
    if (!userIds.includes(userId)) {
      userIds.push(userId);
      this.tenantUsers.set(tenantId, userIds);
    }

    return true;
  }

  async removeUserFromTenant(userId: string, tenantId: string): Promise<boolean> {
    const userIds = this.tenantUsers.get(tenantId) || [];
    const index = userIds.indexOf(userId);

    if (index > -1) {
      userIds.splice(index, 1);
      this.tenantUsers.set(tenantId, userIds);
      return true;
    }

    return false;
  }

  async getTenantUsers(tenantId: string): Promise<string[]> {
    return this.tenantUsers.get(tenantId) || [];
  }

  async getUserTenants(userId: string): Promise<Tenant[]> {
    const userTenants: Tenant[] = [];

    for (const [tenantId, userIds] of this.tenantUsers) {
      if (userIds.includes(userId)) {
        const tenant = this.tenants.get(tenantId);
        if (tenant) {
          userTenants.push(tenant);
        }
      }
    }

    return userTenants;
  }

  private getDefaultQuotas(plan: TenantPlan): TenantQuotas {
    const quotas: Record<TenantPlan, TenantQuotas> = {
      starter: {
        maxUsers: 10,
        maxRequestsPerMonth: 100000,
        maxStorageGB: 1,
        features: ['basic-firewall', 'email-support'],
      },
      professional: {
        maxUsers: 100,
        maxRequestsPerMonth: 1000000,
        maxStorageGB: 10,
        features: ['advanced-firewall', 'siem-integration', 'priority-support'],
      },
      enterprise: {
        maxUsers: -1, // unlimited
        maxRequestsPerMonth: -1, // unlimited
        maxStorageGB: 100,
        features: ['enterprise-firewall', 'custom-integrations', 'dedicated-support'],
      },
    };

    return quotas[plan];
  }

  async checkQuota(
    tenantId: string,
    quotaType: keyof TenantQuotas,
    value: number,
  ): Promise<boolean> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    const quota = tenant.quotas[quotaType];

    if (typeof quota === 'number') {
      return quota === -1 || value <= quota;
    }

    return true;
  }
}

// RBAC (Role-Based Access Control)
export class RBACService {
  private static instance: RBACService;
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private userRoles: Map<string, string[]> = new Map(); // userId -> roleIds

  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  async initialize(): Promise<void> {
    await this.createDefaultRoles();
    await this.createDefaultPermissions();
    console.log('RBAC Service initialized');
  }

  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    const roleId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const role: Role = {
      id: roleId,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      parentRoles: roleData.parentRoles || [],
      settings: roleData.settings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.roles.set(roleId, role);
    return role;
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
    const role = this.roles.get(roleId);
    if (!role) {
      return false;
    }

    const userRoles = this.userRoles.get(userId) || [];
    if (!userRoles.includes(roleId)) {
      userRoles.push(roleId);
      this.userRoles.set(userId, userRoles);
    }

    return true;
  }

  async revokeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const userRoles = this.userRoles.get(userId) || [];
    const index = userRoles.indexOf(roleId);

    if (index > -1) {
      userRoles.splice(index, 1);
      this.userRoles.set(userId, userRoles);
      return true;
    }

    return false;
  }

  async hasPermission(userId: string, permission: string, resource?: string): Promise<boolean> {
    const userRoles = this.userRoles.get(userId) || [];

    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      // Check direct permissions
      if (
        role.permissions.some(
          (p) => p.permission === permission && (!resource || p.resource === resource),
        )
      ) {
        return true;
      }

      // Check inherited permissions from parent roles
      for (const parentRoleId of role.parentRoles) {
        const parentRole = this.roles.get(parentRoleId);
        if (
          parentRole &&
          parentRole.permissions.some(
            (p) => p.permission === permission && (!resource || p.resource === resource),
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = this.userRoles.get(userId) || [];
    const permissions: Permission[] = [];

    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      // Add direct permissions
      for (const rolePerm of role.permissions) {
        if (!permissions.some((p) => p.id === rolePerm.permission)) {
          const permission = this.permissions.get(rolePerm.permission);
          if (permission) {
            permissions.push(permission);
          }
        }
      }

      // Add inherited permissions
      for (const parentRoleId of role.parentRoles) {
        const parentRole = this.roles.get(parentRoleId);
        if (parentRole) {
          for (const rolePerm of parentRole.permissions) {
            if (!permissions.some((p) => p.id === rolePerm.permission)) {
              const permission = this.permissions.get(rolePerm.permission);
              if (permission) {
                permissions.push(permission);
              }
            }
          }
        }
      }
    }

    return permissions;
  }

  private async createDefaultRoles(): Promise<void> {
    // Super Admin Role
    await this.createRole({
      name: 'super_admin',
      description: 'Full system access',
      permissions: [
        { permission: 'admin.*', resource: '*' },
        { permission: 'user.*', resource: '*' },
        { permission: 'tenant.*', resource: '*' },
        { permission: 'firewall.*', resource: '*' },
      ],
    });

    // Tenant Admin Role
    await this.createRole({
      name: 'tenant_admin',
      description: 'Tenant administration access',
      permissions: [
        { permission: 'user.manage', resource: 'own_tenant' },
        { permission: 'firewall.configure', resource: 'own_tenant' },
        { permission: 'reports.view', resource: 'own_tenant' },
      ],
    });

    // Security Analyst Role
    await this.createRole({
      name: 'security_analyst',
      description: 'Security monitoring and analysis',
      permissions: [
        { permission: 'firewall.view', resource: 'own_tenant' },
        { permission: 'reports.view', resource: 'own_tenant' },
        { permission: 'alerts.view', resource: 'own_tenant' },
      ],
    });

    // User Role
    await this.createRole({
      name: 'user',
      description: 'Basic user access',
      permissions: [
        { permission: 'firewall.use', resource: 'own_account' },
        { permission: 'profile.view', resource: 'own' },
      ],
    });
  }

  private async createDefaultPermissions(): Promise<void> {
    const permissions = [
      { id: 'admin.*', name: 'Full Administration', description: 'Complete administrative access' },
      { id: 'user.manage', name: 'User Management', description: 'Create, update, delete users' },
      { id: 'tenant.manage', name: 'Tenant Management', description: 'Manage tenant settings' },
      {
        id: 'firewall.*',
        name: 'Firewall Administration',
        description: 'Complete firewall access',
      },
      {
        id: 'firewall.configure',
        name: 'Firewall Configuration',
        description: 'Configure firewall settings',
      },
      {
        id: 'firewall.view',
        name: 'Firewall Viewing',
        description: 'View firewall status and logs',
      },
      { id: 'firewall.use', name: 'Firewall Usage', description: 'Use firewall for protection' },
      { id: 'reports.view', name: 'Reports Viewing', description: 'View reports and analytics' },
      { id: 'alerts.view', name: 'Alerts Viewing', description: 'View security alerts' },
      { id: 'profile.view', name: 'Profile Viewing', description: 'View user profile' },
    ];

    for (const perm of permissions) {
      this.permissions.set(perm.id, perm);
    }
  }
}

// SLA (Service Level Agreement) Management
export class SLAService {
  private static instance: SLAService;
  private slaMetrics: Map<string, SLAMetric[]> = new Map();
  private slaAgreements: Map<string, SLA> = new Map();

  static getInstance(): SLAService {
    if (!SLAService.instance) {
      SLAService.instance = new SLAService();
    }
    return SLAService.instance;
  }

  async createSLA(slaData: CreateSLARequest): Promise<SLA> {
    const slaId = `sla_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sla: SLA = {
      id: slaId,
      name: slaData.name,
      description: slaData.description,
      tenantId: slaData.tenantId,
      serviceTier: slaData.serviceTier,
      metrics: slaData.metrics,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.slaAgreements.set(slaId, sla);
    return sla;
  }

  async recordMetric(
    tenantId: string,
    metricType: string,
    value: number,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    const metric: SLAMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type: metricType,
      value,
      timestamp: new Date().toISOString(),
      metadata,
    };

    const tenantMetrics = this.slaMetrics.get(tenantId) || [];
    tenantMetrics.push(metric);

    // Keep only recent metrics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMetrics = tenantMetrics.filter((m) => new Date(m.timestamp) > thirtyDaysAgo);

    this.slaMetrics.set(tenantId, recentMetrics);
  }

  async getSLAMetrics(tenantId: string, timeRange: string): Promise<SLAMetric[]> {
    const tenantMetrics = this.slaMetrics.get(tenantId) || [];
    const now = new Date();

    let startDate: Date;
    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return tenantMetrics.filter((m) => new Date(m.timestamp) >= startDate);
  }

  async checkSLAViolations(tenantId: string): Promise<SLAViolation[]> {
    const sla = Array.from(this.slaAgreements.values()).find(
      (s) => s.tenantId === tenantId && s.status === 'active',
    );

    if (!sla) {
      return [];
    }

    const violations: SLAViolation[] = [];
    const metrics = await this.getSLAMetrics(tenantId, '24h');

    for (const slaMetric of sla.metrics) {
      const relevantMetrics = metrics.filter((m) => m.type === slaMetric.type);

      if (relevantMetrics.length === 0) {
        violations.push({
          id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          slaId: sla.id,
          metricType: slaMetric.type,
          threshold: slaMetric.threshold,
          actualValue: 0,
          violationTime: new Date().toISOString(),
          severity: 'high',
          description: `No metrics recorded for ${slaMetric.type}`,
        });
        continue;
      }

      const avgValue =
        relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length;

      if (!this.isWithinThreshold(avgValue, slaMetric.threshold, slaMetric.operator)) {
        violations.push({
          id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          slaId: sla.id,
          metricType: slaMetric.type,
          threshold: slaMetric.threshold,
          actualValue: avgValue,
          violationTime: new Date().toISOString(),
          severity: avgValue < slaMetric.threshold ? 'high' : 'medium',
          description: `SLA violation: ${slaMetric.type} is ${avgValue} (threshold: ${slaMetric.operator} ${slaMetric.threshold})`,
        });
      }
    }

    return violations;
  }

  async generateSLAReport(tenantId: string, timeRange: string): Promise<SLAReport> {
    const sla = Array.from(this.slaAgreements.values()).find(
      (s) => s.tenantId === tenantId && s.status === 'active',
    );

    if (!sla) {
      throw new Error('No active SLA found for tenant');
    }

    const metrics = await this.getSLAMetrics(tenantId, timeRange);
    const violations = await this.checkSLAViolations(tenantId);

    const report: SLAReport = {
      tenantId,
      slaId: sla.id,
      timeRange,
      generatedAt: new Date().toISOString(),
      metrics: this.aggregateMetrics(metrics),
      violations,
      compliance: this.calculateCompliance(metrics, sla),
      summary: this.generateSummary(metrics, violations, sla),
    };

    return report;
  }

  private aggregateMetrics(metrics: SLAMetric[]): AggregatedMetric[] {
    const aggregated = new Map<string, { sum: number; count: number; min: number; max: number }>();

    for (const metric of metrics) {
      const existing = aggregated.get(metric.type) || {
        sum: 0,
        count: 0,
        min: Infinity,
        max: -Infinity,
      };

      aggregated.set(metric.type, {
        sum: existing.sum + metric.value,
        count: existing.count + 1,
        min: Math.min(existing.min, metric.value),
        max: Math.max(existing.max, metric.value),
      });
    }

    return Array.from(aggregated.entries()).map(([type, stats]) => ({
      type,
      average: stats.sum / stats.count,
      min: stats.min,
      max: stats.max,
      count: stats.count,
    }));
  }

  private calculateCompliance(metrics: SLAMetric[], sla: SLA): SLACompliance {
    const compliance: SLACompliance = {
      overall: 100,
      byMetric: {},
    };

    for (const slaMetric of sla.metrics) {
      const relevantMetrics = metrics.filter((m) => m.type === slaMetric.type);

      if (relevantMetrics.length === 0) {
        compliance.byMetric[slaMetric.type] = 0;
        compliance.overall = Math.min(compliance.overall, 0);
        continue;
      }

      const avgValue =
        relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length;
      const metricCompliance = this.isWithinThreshold(
        avgValue,
        slaMetric.threshold,
        slaMetric.operator,
      )
        ? 100
        : 0;

      compliance.byMetric[slaMetric.type] = metricCompliance;
      compliance.overall = Math.min(compliance.overall, metricCompliance);
    }

    return compliance;
  }

  private generateSummary(
    metrics: SLAMetric[],
    violations: SLAViolation[],
    sla: SLA,
  ): SLAReportSummary {
    const totalMetrics = metrics.length;
    const totalViolations = violations.length;
    const uptime = totalMetrics > 0 ? ((totalMetrics - totalViolations) / totalMetrics) * 100 : 100;

    return {
      totalMetrics,
      totalViolations,
      uptime,
      averageResponseTime: this.calculateAverage(metrics, 'response_time'),
      averageThroughput: this.calculateAverage(metrics, 'throughput'),
      mostCommonViolation: violations.length > 0 ? violations[0].metricType : null,
    };
  }

  private calculateAverage(metrics: SLAMetric[], type: string): number {
    const relevantMetrics = metrics.filter((m) => m.type === type);
    if (relevantMetrics.length === 0) return 0;

    return relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length;
  }

  private isWithinThreshold(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      default:
        return true;
    }
  }
}
