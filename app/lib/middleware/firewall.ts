/**
 * SIGMACODE AI - Firewall Middleware
 * Integriert in alle Dify-Proxy-Calls
 */

import { logger } from '@/lib/logger';
import { getDb } from '@/database/db';
import { firewallBindings } from '@/database/schema/firewall_policies';
import { and, eq } from 'drizzle-orm';

export interface FirewallConfig {
  enabled: boolean;
  mode: 'enforce' | 'shadow' | 'off';
  url: string;
  apiKey: string;
}

export interface FirewallCheckResult {
  allowed: boolean;
  threats: string[];
  score: number;
  message?: string;
}

export class FirewallMiddleware {
  private config: FirewallConfig;

  constructor(config?: Partial<FirewallConfig>) {
    this.config = {
      enabled: process.env.FIREWALL_ENABLED === 'true',
      mode: (process.env.FIREWALL_MODE as 'enforce' | 'shadow' | 'off') || 'enforce',
      url: process.env.SUPERAGENT_URL || 'http://localhost:8000',
      apiKey: process.env.SUPERAGENT_API_KEY || '',
      ...config,
    };
  }

  /**
   * Prüft anhand der Bindings, ob die Firewall für eine gegebene Route angewendet werden soll.
   * Regel: Wenn aktive Bindings existieren, gilt Allow nur für passende Prefixe.
   * Wenn keine Bindings existieren, greift globale Einstellung (enabled/mode).
   */
  async shouldApply(routePath: string, tenantId?: string): Promise<boolean> {
    if (!this.config.enabled || this.config.mode === 'off') return false;
    try {
      const db = await getDb();
      const rows = await db
        .select()
        .from(firewallBindings)
        .where(
          tenantId
            ? (and(
                eq(firewallBindings.tenantId as any, tenantId) as any,
                eq(firewallBindings.isActive as any, true) as any,
              ) as any)
            : (eq(firewallBindings.isActive as any, true) as any),
        );

      if (!rows || rows.length === 0) {
        // Keine Bindings: globale Einstellung verwenden -> wir sind bereits nicht 'off' (siehe early-return)
        return true;
      }

      // Mindestens ein aktives Binding vorhanden: Route muss matchen
      const match = rows.some((b: any) => b.routePrefix && routePath.startsWith(b.routePrefix));
      return match;
    } catch (error) {
      logger.error({ error }, 'shouldApply bindings lookup failed');
      // Fallback: lieber anwenden (fail-safe), da global enabled und nicht 'off'
      return true;
    }
  }

  async checkInput(input: string, userId?: string): Promise<FirewallCheckResult> {
    if (!this.config.enabled || this.config.mode === 'off') {
      return { allowed: true, threats: [], score: 1.0 };
    }

    try {
      const response = await fetch(`${this.config.url}/api/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          text: input,
          userId,
          type: 'input',
        }),
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Firewall check failed');
        // Bei Fehler: In Shadow-Mode allow, in Enforce-Mode block
        return {
          allowed: this.config.mode === 'shadow',
          threats: ['firewall_error'],
          score: 0,
          message: 'Firewall service unavailable',
        };
      }

      const result = await response.json();

      const allowed = result.safe || this.config.mode === 'shadow';

      // Log threats
      if (result.threats && result.threats.length > 0) {
        await this.logThreat({
          userId,
          input,
          threats: result.threats,
          mode: this.config.mode,
          allowed,
        });
      }

      return {
        allowed,
        threats: result.threats || [],
        score: result.score || 0,
        message: result.message,
      };
    } catch (error) {
      logger.error({ error }, 'Firewall check error');

      // Bei Fehler: Shadow-Mode = allow, Enforce = block
      return {
        allowed: this.config.mode === 'shadow',
        threats: ['firewall_error'],
        score: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkOutput(output: string, userId?: string): Promise<FirewallCheckResult> {
    if (!this.config.enabled || this.config.mode === 'off') {
      return { allowed: true, threats: [], score: 1.0 };
    }

    try {
      const response = await fetch(`${this.config.url}/api/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          text: output,
          userId,
          type: 'output',
        }),
      });

      if (!response.ok) {
        return {
          allowed: this.config.mode === 'shadow',
          threats: ['firewall_error'],
          score: 0,
          message: 'Firewall service unavailable',
        };
      }

      const result = await response.json();
      const allowed = result.safe || this.config.mode === 'shadow';

      if (result.threats && result.threats.length > 0) {
        await this.logThreat({
          userId,
          output,
          threats: result.threats,
          mode: this.config.mode,
          allowed,
        });
      }

      return {
        allowed,
        threats: result.threats || [],
        score: result.score || 0,
        message: result.message,
      };
    } catch (error) {
      logger.error({ error }, 'Firewall output check error');
      return {
        allowed: this.config.mode === 'shadow',
        threats: ['firewall_error'],
        score: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async logThreat(data: {
    userId?: string;
    input?: string;
    output?: string;
    threats: string[];
    mode: string;
    allowed: boolean;
  }) {
    try {
      // Log to database (async, non-blocking)
      await fetch('/api/firewall/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      logger.error({ error }, 'Failed to log threat');
    }
  }

  isEnabled(): boolean {
    return this.config.enabled && this.config.mode !== 'off';
  }

  getMode(): string {
    return this.config.mode;
  }
}

// Singleton instance
let firewallInstance: FirewallMiddleware | null = null;

export function getFirewall(): FirewallMiddleware {
  if (!firewallInstance) {
    firewallInstance = new FirewallMiddleware();
  }
  return firewallInstance;
}

// Helper für API-Routes
export async function withFirewall<T>(
  input: string,
  handler: () => Promise<T>,
  userId?: string,
): Promise<T> {
  const firewall = getFirewall();

  // Pre-Check
  const preCheck = await firewall.checkInput(input, userId);
  if (!preCheck.allowed) {
    throw new Error(`Firewall blocked: ${preCheck.threats.join(', ')}`);
  }

  // Execute
  const result = await handler();

  // Post-Check (nur für String-Results)
  if (typeof result === 'string') {
    const postCheck = await firewall.checkOutput(result, userId);
    if (!postCheck.allowed) {
      throw new Error(`Firewall blocked output: ${postCheck.threats.join(', ')}`);
    }
  }

  return result;
}
