import { getDb } from '@/database/db';
import { subscriptions } from '@/database/schema/subscriptions';
import { plans } from '@/database/schema/plans';
import { planEntitlements } from '@/database/schema/planEntitlements';
import { entitlements } from '@/database/schema/entitlements';
import { userEntitlements } from '@/database/schema/userEntitlements';
import { and, desc, eq } from 'drizzle-orm';

export type EntitlementMap = Record<string, string>;

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export async function getEffectiveEntitlements(userId: string): Promise<EntitlementMap> {
  // 1) Aktives Abo ermitteln (falls mehrere, das jüngste aktive)
  const db = await getDb();
  const subArr = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  const sub = subArr[0];

  const map: EntitlementMap = {};

  if (sub) {
    // 2) Plan-Entitlements laden
    const planEnts = await db
      .select({ id: entitlements.id, name: entitlements.name })
      .from(planEntitlements)
      .innerJoin(entitlements, eq(planEntitlements.entitlementId, entitlements.id))
      .where(eq(planEntitlements.planId, sub.planId));

    for (const e of planEnts) {
      // Plan-Entitlements haben keinen Default-Wert hier –
      // values werden per Konvention über den Entitlement-Key gedeutet,
      // konkrete numerische Werte kommen typischerweise aus user_overrides oder
      // werden produktseitig als feste Tiers interpretiert.
      // Wir setzen den Key mit leerem String, damit overrides ihn überschreiben können.
      map[e.id] = map[e.id] ?? '';
    }
  }

  // 3) User-Overrides laden (setzen Werte direkt)
  const userEnts = await db
    .select()
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, userId));

  for (const ue of userEnts) {
    map[ue.entitlementId] = toStringValue(ue.value);
  }

  return map;
}

export function getNumberEntitlement(
  entitlements: EntitlementMap,
  key: string,
  fallback: number,
): number {
  const raw = entitlements[key];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function getStringEntitlement(
  entitlements: EntitlementMap,
  key: string,
  fallback: string,
): string {
  const raw = entitlements[key];
  if (raw === undefined || raw === '') return fallback;
  return String(raw);
}

// Compatibility helper used by existing routes
export async function getEntitlementsForUser(userId: string): Promise<Set<string>> {
  const map = await getEffectiveEntitlements(userId);
  return new Set(Object.keys(map));
}
