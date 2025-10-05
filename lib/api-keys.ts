import crypto, { randomUUID } from 'crypto';
import { getDb } from '@/database/db';
import { apiKeys } from '@/database/schema/apiKeys';
import { apiKeyUsage } from '@/database/schema/apiKeyUsage';
import { eq, and, sql, desc } from 'drizzle-orm';

export interface CreateApiKeyParams {
  userId: string;
  name?: string;
  scopes?: string[];
  expiresAt?: Date;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
  quotaLimit?: number;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  key?: typeof apiKeys.$inferSelect;
  error?: string;
}

export class ApiKeyService {
  private static readonly API_KEY_PREFIX = 'sk-';
  private static readonly API_KEY_LENGTH = 64;

  /**
   * Erstellt einen neuen API-Key für einen User
   */
  public static async createApiKey(params: CreateApiKeyParams): Promise<string> {
    const id = randomUUID();
    const keyId = this.generateKeyId();
    const rawKey = this.generateRawKey();
    const hashedKey = this.hashKey(rawKey);

    const db = await getDb();
    await db.insert(apiKeys).values({
      id,
      keyId,
      hashedKey,
      userId: params.userId,
      name: params.name || null,
      scopes: params.scopes || ['agents:invoke'],
      status: 'active',
      expiresAt: params.expiresAt || null,
      rateLimitRpm: params.rateLimitRpm ?? 60,
      rateLimitTpm: params.rateLimitTpm ?? 100000,
      quotaLimit: params.quotaLimit ?? 1000000,
      quotaUsed: 0,
      quotaResetAt: new Date(),
    });

    // Return concatenated public+secret so caller can show it once
    return `${keyId}${rawKey}`;
  }

  /**
   * Validiert einen API-Key und gibt den Key-Datensatz zurück
   */
  static async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    if (!apiKey.startsWith(this.API_KEY_PREFIX)) {
      return { isValid: false, error: 'Invalid API key format' };
    }

    const keyId = apiKey.slice(0, this.API_KEY_PREFIX.length + 16); // sk- + 16 hex chars
    const rawKey = apiKey.slice(keyId.length);
    const hashedKey = this.hashKey(rawKey);

    const db = await getDb();
    const keyArr = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.keyId, keyId),
          eq(apiKeys.hashedKey, hashedKey),
          eq(apiKeys.status, 'active'),
        ),
      )
      .limit(1);
    const key = keyArr[0];

    if (!key) {
      return { isValid: false, error: 'Invalid API key' };
    }

    // Check expiration
    if (key.expiresAt && key.expiresAt < new Date()) {
      return { isValid: false, error: 'API key expired' };
    }

    return { isValid: true, key };
  }

  /**
   * Prüft Rate Limits für einen API-Key
   */
  static async checkRateLimit(apiKeyId: string): Promise<{ allowed: boolean; remaining: number }> {
    const db = await getDb();
    const keyArr = await db.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId)).limit(1);
    const key = keyArr[0];

    if (!key) {
      return { allowed: false, remaining: 0 };
    }

    // Check if we need to reset the window
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 1000); // 1 minute window

    const usageArr = await db
      .select()
      .from(apiKeyUsage)
      .where(
        and(eq(apiKeyUsage.apiKeyId, apiKeyId), sql`${apiKeyUsage.windowStart} >= ${windowStart}`),
      )
      .orderBy(desc(apiKeyUsage.createdAt))
      .limit(1);
    const usage = usageArr[0];

    if (!usage || usage.windowStart < windowStart) {
      // Create new usage record
      await db.insert(apiKeyUsage).values({
        id: randomUUID(),
        apiKeyId,
        requestCount: 1,
        tokenCount: 0,
        windowStart: now,
      });
      const rpm = key.rateLimitRpm ?? 60;
      return { allowed: true, remaining: Math.max(0, rpm - 1) };
    }

    const rpm = key.rateLimitRpm ?? 60;
    if (usage.requestCount >= rpm) {
      return { allowed: false, remaining: 0 };
    }

    // Update usage
    await db
      .update(apiKeyUsage)
      .set({
        requestCount: sql`${apiKeyUsage.requestCount} + 1`,
      })
      .where(eq(apiKeyUsage.id, usage.id));

    return { allowed: true, remaining: Math.max(0, rpm - usage.requestCount - 1) };
  }

  /**
   * Prüft Token Quota für einen API-Key
   */
  static async checkTokenQuota(
    apiKeyId: string,
    tokenCount: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const db = await getDb();
    const keyArr = await db.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId)).limit(1);
    const key = keyArr[0];

    if (!key) {
      return { allowed: false, remaining: 0 };
    }

    const quotaLimit = key.quotaLimit ?? 1000000;
    const prevUsed = key.quotaUsed ?? 0;
    const newUsage = prevUsed + tokenCount;

    if (newUsage > quotaLimit) {
      return { allowed: false, remaining: 0 };
    }

    // Update quota usage
    await db
      .update(apiKeys)
      .set({
        quotaUsed: newUsage,
      })
      .where(eq(apiKeys.id, apiKeyId));

    return { allowed: true, remaining: Math.max(0, quotaLimit - newUsage) };
  }

  /**
   * Holt alle API-Keys für einen User
   */
  static async getUserApiKeys(userId: string) {
    const db = await getDb();
    return await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  /**
   * Löscht einen API-Key
   */
  static async deleteApiKey(keyId: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Revoked einen API-Key
   */
  static async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .update(apiKeys)
      .set({
        status: 'revoked',
        updatedAt: new Date(),
      })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
      .returning();

    return result.length > 0;
  }

  private static generateKeyId(): string {
    return this.API_KEY_PREFIX + crypto.randomBytes(8).toString('hex');
  }

  private static generateRawKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private static hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
