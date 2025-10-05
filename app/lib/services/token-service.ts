/**
 * SIGMACODE AI - Token Service
 * Agent-as-a-Service Token-System
 */

import { getDb } from '@/database/db';
import { users, usageLog, subscriptions } from '@/database/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export interface TokenCosts {
  chat_message: number;
  workflow_run: number;
  agent_execution: number;
  document_upload: number;
  image_generation: number;
  embedding: number;
}

// Token-Kosten pro Aktion
export const TOKEN_COSTS: TokenCosts = {
  chat_message: 1,
  workflow_run: 5,
  agent_execution: 10,
  document_upload: 20,
  image_generation: 50,
  embedding: 2,
};

// Token-Packages
export const TOKEN_PACKAGES = [
  { id: 'starter', name: 'Starter', tokens: 1000, price: 9.99, priceId: 'price_starter' },
  { id: 'pro', name: 'Pro', tokens: 10000, price: 79.99, priceId: 'price_pro' },
  { id: 'business', name: 'Business', tokens: 50000, price: 299.99, priceId: 'price_business' },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tokens: 200000,
    price: 999.99,
    priceId: 'price_enterprise',
  },
];

export class TokenService {
  /**
   * Check if user has enough tokens
   */
  async hasEnoughTokens(userId: string, action: keyof TokenCosts): Promise<boolean> {
    const cost = TOKEN_COSTS[action];
    const balance = await this.getBalance(userId);
    return balance >= cost;
  }

  /**
   * Get user token balance
   */
  async getBalance(userId: string): Promise<number> {
    const dbc = await getDb();
    const [user] = await dbc
      .select({ tokenBalance: users.tokenBalance })
      .from(users)
      .where(eq(users.id, userId));

    return user?.tokenBalance || 0;
  }

  /**
   * Deduct tokens for an action
   */
  async deductTokens(
    userId: string,
    action: keyof TokenCosts,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const cost = TOKEN_COSTS[action];
    const balance = await this.getBalance(userId);

    if (balance < cost) {
      throw new Error(`Insufficient tokens. Required: ${cost}, Available: ${balance}`);
    }

    // Deduct from balance
    const dbc = await getDb();
    await dbc
      .update(users)
      .set({ tokenBalance: balance - cost })
      .where(eq(users.id, userId));

    // Log usage
    await this.logUsage(userId, action, cost, metadata);

    logger.info({ userId, action, cost, newBalance: balance - cost }, 'Tokens deducted');
  }

  /**
   * Add tokens to user balance
   */
  async addTokens(userId: string, amount: number, reason: string): Promise<void> {
    const dbc = await getDb();

    const balance = await this.getBalance(userId);
    const newBalance = balance + amount;

    await dbc.update(users).set({ tokenBalance: newBalance }).where(eq(users.id, userId));

    logger.info({ userId, amount, reason, newBalance }, 'Tokens added');
  }

  /**
   * Log token usage
   */
  private async logUsage(
    userId: string,
    action: string,
    tokensCost: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const dbc = await getDb();
    await dbc.insert(usageLog).values({
      userId,
      action,
      tokensCost,
      metadata: metadata ? JSON.stringify(metadata) : null,
      timestamp: new Date(),
    });
  }

  /**
   * Get usage history
   */
  async getUsageHistory(userId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const conditions = [eq(usageLog.userId, userId)];

    if (startDate) {
      conditions.push(gte(usageLog.timestamp, startDate));
    }

    if (endDate) {
      conditions.push(lte(usageLog.timestamp, endDate));
    }

    const dbc = await getDb();
    return await dbc
      .select()
      .from(usageLog)
      .where(and(...conditions))
      .orderBy(usageLog.timestamp)
      .limit(100);
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(
    userId: string,
    period: 'day' | 'week' | 'month' = 'month',
  ): Promise<{
    totalTokens: number;
    totalCost: number;
    actionBreakdown: Record<string, number>;
  }> {
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const usage = await this.getUsageHistory(userId, startDate);

    const stats = usage.reduce(
      (acc, log) => {
        acc.totalTokens += log.tokensCost;
        acc.actionBreakdown[log.action] = (acc.actionBreakdown[log.action] || 0) + log.tokensCost;
        return acc;
      },
      { totalTokens: 0, totalCost: 0, actionBreakdown: {} as Record<string, number> },
    );

    // Calculate cost based on package (simplified)
    stats.totalCost = stats.totalTokens * 0.01; // $0.01 per token (adjust as needed)

    return stats;
  }

  /**
   * Check subscription status
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const dbc = await getDb();
    const [sub] = await dbc
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')));

    return !!sub;
  }

  /**
   * Get subscription details
   */
  async getSubscription(userId: string): Promise<any | null> {
    const dbc = await getDb();
    const [sub] = await dbc
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(subscriptions.createdAt)
      .limit(1);

    return sub || null;
  }

  /**
   * Refund tokens (for failed operations)
   */
  async refundTokens(userId: string, action: keyof TokenCosts, reason: string): Promise<void> {
    const cost = TOKEN_COSTS[action];
    await this.addTokens(userId, cost, `Refund: ${reason}`);
  }
}

// Singleton
let tokenServiceInstance: TokenService | null = null;

export function getTokenService(): TokenService {
  if (!tokenServiceInstance) {
    tokenServiceInstance = new TokenService();
  }
  return tokenServiceInstance;
}

// Helper для API-Routes
export async function withTokenCheck<T>(
  userId: string,
  action: keyof TokenCosts,
  handler: () => Promise<T>,
): Promise<T> {
  const service = getTokenService();

  // Check balance
  const hasEnough = await service.hasEnoughTokens(userId, action);
  if (!hasEnough) {
    const balance = await service.getBalance(userId);
    const required = TOKEN_COSTS[action];
    throw new Error(`Insufficient tokens. Required: ${required}, Available: ${balance}`);
  }

  try {
    // Execute
    const result = await handler();

    // Deduct tokens
    await service.deductTokens(userId, action);

    return result;
  } catch (error) {
    // No deduction on error
    logger.error({ error, userId, action }, 'Action failed, tokens not deducted');
    throw error;
  }
}
