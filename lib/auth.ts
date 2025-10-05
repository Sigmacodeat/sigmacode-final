// SIGMACODE Auth System - State of the Art Implementation
// Enterprise-grade authentication with NextAuth, metrics, and advanced security

// NextAuth v5: Server-Session über auth() aus eigener NextAuth-Factory beziehen
import { auth } from '@/lib/auth-nextauth';
import { authConfig } from '@/lib/auth-config';
import { decode } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import crypto from 'crypto';
import { EventEmitter } from 'events';

// Advanced Error Types
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly severity: 'low' | 'medium' | 'high' | 'critical',
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class TokenVerificationError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'TOKEN_VERIFICATION_ERROR', 'high', context);
    this.name = 'TokenVerificationError';
  }
}

export class SessionError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SESSION_ERROR', 'medium', context);
    this.name = 'SessionError';
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 'critical', context);
    this.name = 'AuthorizationError';
  }
}

// Auth Metrics Collector
class AuthMetricsCollector {
  private static instance: AuthMetricsCollector;
  private metrics: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  static getInstance(): AuthMetricsCollector {
    if (!AuthMetricsCollector.instance) {
      AuthMetricsCollector.instance = new AuthMetricsCollector();
    }
    return AuthMetricsCollector.instance;
  }

  incrementCounter(name: string, value: number = 1) {
    this.counters.set(name, (this.counters.get(name) || 0) + value);
  }

  recordValue(name: string, value: number) {
    this.metrics.set(name, value);
  }

  recordHistogram(name: string, value: number) {
    const values = this.histograms.get(name) || [];
    values.push(value);
    this.histograms.set(name, values);
  }

  getMetrics() {
    return {
      metrics: Object.fromEntries(this.metrics),
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([key, values]) => [
          key,
          {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
          },
        ]),
      ),
    };
  }

  reset() {
    this.metrics.clear();
    this.counters.clear();
    this.histograms.clear();
  }
}

// Auth Events
export enum AuthEvent {
  SESSION_CREATED = 'session_created',
  SESSION_DESTROYED = 'session_destroyed',
  TOKEN_VERIFIED = 'token_verified',
  TOKEN_VERIFICATION_FAILED = 'token_verification_failed',
  AUTHORIZATION_FAILED = 'authorization_failed',
  AUTHORIZATION_SUCCESS = 'authorization_success',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PASSWORD_RESET = 'password_reset',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
}

// Enhanced User Interface
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  roles?: string[];
  permissions?: string[];
  lastLogin?: string;
  loginCount?: number;
  mfaEnabled?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Enhanced Session Interface
export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  expires: string;
  error?: string;
}

// Role-based Access Control
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

export enum Permission {
  // User permissions
  READ_PROFILE = 'read:profile',
  WRITE_PROFILE = 'write:profile',
  DELETE_PROFILE = 'delete:profile',

  // Admin permissions
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',

  // Content permissions
  READ_CONTENT = 'read:content',
  WRITE_CONTENT = 'write:content',
  DELETE_CONTENT = 'delete:content',
  PUBLISH_CONTENT = 'publish:content',

  // System permissions
  READ_LOGS = 'read:logs',
  WRITE_LOGS = 'write:logs',
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_MAINTENANCE = 'system:maintenance',
}

// Permission Matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.MODERATOR]: [
    Permission.READ_PROFILE,
    Permission.WRITE_PROFILE,
    Permission.READ_CONTENT,
    Permission.WRITE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.PUBLISH_CONTENT,
    Permission.READ_USERS,
    Permission.READ_LOGS,
  ],
  [UserRole.USER]: [
    Permission.READ_PROFILE,
    Permission.WRITE_PROFILE,
    Permission.READ_CONTENT,
    Permission.WRITE_CONTENT,
  ],
  [UserRole.GUEST]: [Permission.READ_CONTENT],
};

// Enhanced Auth Manager
export class AuthManager extends EventEmitter {
  private metrics = AuthMetricsCollector.getInstance();
  private readonly maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours
  private readonly refreshTokenAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor() {
    super();
  }

  /**
   * Get the current NextAuth session with enhanced error handling and metrics
   * @returns Promise<AuthSession | null>
   */
  async getServerAuthSession(): Promise<AuthSession | null> {
    const startTime = Date.now();

    try {
      // Nutze die in lib/auth-nextauth.ts exportierte auth()-Funktion (NextAuth v5)
      const session = (await auth()) as unknown as AuthSession;

      const duration = Date.now() - startTime;

      if (this.metrics) {
        this.metrics.incrementCounter('auth_session_requests');
        this.metrics.recordHistogram('auth_session_duration', duration);

        if (session) {
          this.metrics.incrementCounter('auth_session_success');
          this.emit(AuthEvent.SESSION_CREATED, { session, duration });
        } else {
          this.metrics.incrementCounter('auth_session_null');
        }
      }

      return session;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('auth_session_errors');
      this.metrics.recordHistogram('auth_session_duration', duration);

      throw new SessionError(
        `Failed to get server session: ${error instanceof Error ? error.message : String(error)}`,
        { duration, error: error instanceof Error ? error.message : String(error) },
      );
    }
  }

  /**
   * Verify a NextAuth JWT token with enhanced security and validation
   * @param token - The JWT token to verify
   * @returns Promise<AuthUser | null>
   */
  async verifyNextAuthToken(token: string | undefined): Promise<AuthUser | null> {
    const startTime = Date.now();

    if (!token) {
      this.metrics.incrementCounter('auth_token_null');
      return null;
    }

    try {
      // Verify NextAuth JWT token using next-auth/jwt
      const decoded = await decode({
        token,
        secret: process.env.NEXTAUTH_SECRET!,
        salt: process.env.NEXTAUTH_SECRET!,
      });

      if (!decoded || typeof decoded !== 'object') {
        this.metrics.incrementCounter('auth_token_invalid_format');
        this.emit(AuthEvent.TOKEN_VERIFICATION_FAILED, { reason: 'invalid_format' });
        return null;
      }

      // Validate token structure and expiration
      const jwtUser = decoded as JWT;

      if (!jwtUser.sub && !jwtUser.id) {
        this.metrics.incrementCounter('auth_token_missing_user_id');
        this.emit(AuthEvent.TOKEN_VERIFICATION_FAILED, { reason: 'missing_user_id' });
        return null;
      }

      if (!jwtUser.email) {
        this.metrics.incrementCounter('auth_token_missing_email');
        this.emit(AuthEvent.TOKEN_VERIFICATION_FAILED, { reason: 'missing_email' });
        return null;
      }

      // Check token expiration
      if (jwtUser.exp && jwtUser.exp * 1000 < Date.now()) {
        this.metrics.incrementCounter('auth_token_expired');
        this.emit(AuthEvent.TOKEN_VERIFICATION_FAILED, { reason: 'expired' });
        return null;
      }

      // Validate token signature and integrity
      const tokenHash = this.calculateTokenHash(token);
      const storedHash = await this.getStoredTokenHash(jwtUser.sub || jwtUser.id);

      if (storedHash && tokenHash !== storedHash) {
        this.metrics.incrementCounter('auth_token_signature_mismatch');
        this.emit(AuthEvent.TOKEN_VERIFICATION_FAILED, { reason: 'signature_mismatch' });
        return null;
      }

      const user: AuthUser = {
        id: jwtUser.id || jwtUser.sub || '',
        email: jwtUser.email || '',
        name: jwtUser.name || undefined,
        image: jwtUser.picture || undefined,
        roles: jwtUser.roles || [UserRole.USER],
        permissions: this.getPermissionsForRoles(jwtUser.roles || [UserRole.USER]),
        lastLogin: jwtUser.lastLogin as string,
        loginCount: jwtUser.loginCount as number,
        mfaEnabled: jwtUser.mfaEnabled as boolean,
        emailVerified: jwtUser.emailVerified as boolean,
        createdAt: jwtUser.createdAt as string,
        updatedAt: jwtUser.updatedAt as string,
      };

      const duration = Date.now() - startTime;

      this.metrics.incrementCounter('auth_token_verification_success');
      this.metrics.recordHistogram('auth_token_verification_duration', duration);
      this.emit(AuthEvent.TOKEN_VERIFIED, { user, duration });

      return user;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('auth_token_verification_errors');
      this.metrics.recordHistogram('auth_token_verification_duration', duration);

      this.emit(AuthEvent.TOKEN_VERIFICATION_FAILED, {
        error: error instanceof Error ? error.message : String(error),
        duration,
      });

      throw new TokenVerificationError(
        `Token verification failed: ${error instanceof Error ? error.message : String(error)}`,
        { duration, error: error instanceof Error ? error.message : String(error) },
      );
    }
  }

  /**
   * Check if user has required permission
   * @param user - The authenticated user
   * @param permission - The required permission
   * @returns boolean
   */
  hasPermission(user: AuthUser | null, permission: Permission): boolean {
    if (!user || !user.permissions) {
      return false;
    }

    const hasPermission = user.permissions.includes(permission);

    if (hasPermission) {
      this.emit(AuthEvent.AUTHORIZATION_SUCCESS, { user: user.id, permission });
    } else {
      this.emit(AuthEvent.AUTHORIZATION_FAILED, { user: user.id, permission });
    }

    return hasPermission;
  }

  /**
   * Check if user has required role
   * @param user - The authenticated user
   * @param role - The required role
   * @returns boolean
   */
  hasRole(user: AuthUser | null, role: UserRole): boolean {
    if (!user || !user.roles) {
      return false;
    }

    return user.roles.includes(role);
  }

  /**
   * Require authentication and authorization
   * @param requiredPermissions - Array of required permissions
   * @param requiredRoles - Array of required roles (optional)
   * @returns Promise<AuthUser>
   */
  async requireAuth(
    requiredPermissions: Permission[] = [],
    requiredRoles: UserRole[] = [],
  ): Promise<AuthUser> {
    const session = await this.getServerAuthSession();

    if (!session || !session.user) {
      throw new AuthorizationError('Authentication required', { session });
    }

    const user = session.user as AuthUser;

    // Check roles
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => this.hasRole(user, role));
      if (!hasRequiredRole) {
        throw new AuthorizationError(`Required roles: ${requiredRoles.join(', ')}`, {
          user: user.id,
          requiredRoles,
          userRoles: user.roles,
        });
      }
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        this.hasPermission(user, permission),
      );

      if (!hasAllPermissions) {
        throw new AuthorizationError(`Required permissions: ${requiredPermissions.join(', ')}`, {
          user: user.id,
          requiredPermissions,
          userPermissions: user.permissions,
        });
      }
    }

    return user;
  }

  /**
   * Create a secure token hash for storage
   * @param token - The token to hash
   * @returns string
   */
  private calculateTokenHash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get stored token hash from cache/database
   * @param userId - The user ID
   * @returns Promise<string | null>
   */
  private async getStoredTokenHash(userId: string): Promise<string | null> {
    // In a real implementation, this would check a secure store
    // For now, we'll just return null to skip this check
    return null;
  }

  /**
   * Get permissions for given roles
   * @param roles - Array of user roles
   * @returns Permission[]
   */
  private getPermissionsForRoles(roles: string[]): Permission[] {
    const permissions = new Set<Permission>();

    roles.forEach((role) => {
      const rolePermissions = ROLE_PERMISSIONS[role as UserRole] || [];
      rolePermissions.forEach((permission) => permissions.add(permission));
    });

    return Array.from(permissions);
  }

  /**
   * Get authentication metrics
   * @returns AuthMetrics
   */
  getMetrics() {
    return this.metrics.getMetrics();
  }

  /**
   * Reset authentication metrics
   */
  resetMetrics() {
    this.metrics.reset();
  }

  /**
   * Generate a secure random token
   * @param length - Token length in bytes
   * @returns string
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Promise<string>
   */
  async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against its hash
   * @param password - Plain text password
   * @param hash - Password hash
   * @returns Promise<boolean>
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(password, hash);
  }
}

// Singleton instance
let authManagerInstance: AuthManager | null = null;

export const getAuthManager = (): AuthManager => {
  if (!authManagerInstance) {
    authManagerInstance = new AuthManager();
  }
  return authManagerInstance;
};

/**
 * Get the current server authentication session
 * @returns Promise<AuthSession | null>
 */
export async function getServerAuthSession(): Promise<AuthSession | null> {
  return getAuthManager().getServerAuthSession();
}
/**
 * Verify a NextAuth JWT token
 * @param token - The JWT token to verify
 * @returns Promise<{sub: string, email: string, roles?: string[]} | null>
 */
export async function verifyNextAuthToken(
  token: string | undefined,
): Promise<{ sub: string; email: string; roles?: string[] } | null> {
  const user = await getAuthManager().verifyNextAuthToken(token);
  if (user) {
    return {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };
  }
  return null;
}

/**
 * Legacy function for backward compatibility - redirects to NextAuth version
 * @deprecated Use verifyNextAuthToken instead
 */
export async function verifyJwt(token: string | undefined) {
  return verifyNextAuthToken(token);
}
