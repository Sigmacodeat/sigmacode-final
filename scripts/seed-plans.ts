import { getDb } from '@/database/db';
import { plans, entitlements, planEntitlements, subscriptions, users } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

async function ensurePlan(
  id: string,
  name: string,
  description: string,
  priceMonthly: number,
  priceYearly: number | null,
) {
  const db = await getDb();
  const existingArr = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  const existing = existingArr[0];
  if (!existing) {
    await db.insert(plans).values({
      id,
      name,
      description,
      priceMonthly: String(priceMonthly),
      priceYearly: priceYearly !== null ? String(priceYearly) : null,
      isActive: true,
    });
  } else {
    await db
      .update(plans)
      .set({
        name,
        description,
        priceMonthly: String(priceMonthly),
        priceYearly: priceYearly !== null ? String(priceYearly) : null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(plans.id, id));
  }
}

async function ensureEntitlement(id: string, name: string, description: string) {
  const db = await getDb();
  const existingArr = await db.select().from(entitlements).where(eq(entitlements.id, id)).limit(1);
  const existing = existingArr[0];
  if (!existing) {
    await db.insert(entitlements).values({ id, name, description, isActive: true });
  } else if (!existing.isActive || existing.name !== name || existing.description !== description) {
    await db
      .update(entitlements)
      .set({ name, description, isActive: true, updatedAt: new Date() })
      .where(eq(entitlements.id, id));
  }
}

async function ensurePlanEntitlement(planId: string, entitlementId: string) {
  const db = await getDb();
  const existingArr = await db
    .select()
    .from(planEntitlements)
    .where(
      and(eq(planEntitlements.planId, planId), eq(planEntitlements.entitlementId, entitlementId)),
    )
    .limit(1);
  const existing = existingArr[0];
  if (!existing) {
    await db.insert(planEntitlements).values({ planId, entitlementId });
  }
}

async function seed() {
  // Plans
  await ensurePlan('plan_free', 'Free', 'Free tier for evaluation', 0, null);
  await ensurePlan('plan_pro', 'Pro', 'Professional tier for teams', 99, 999);
  await ensurePlan('plan_enterprise', 'Enterprise', 'Custom enterprise tier', 0, null);

  // Entitlements (keys referenced in code)
  const ents: Array<[string, string, string]> = [
    ['tokens.monthly_quota', 'Monthly Token Quota', 'Max tokens per month'],
    ['rate.rpm', 'Requests per Minute', 'Rate limit per minute'],
    ['rate.tpm', 'Tokens per Minute', 'Token limit per minute'],
    ['logs.retention_days', 'Log Retention Days', 'Number of days to retain logs'],
    ['explainability.level', 'Explainability Level', 'basic or advanced'],
    ['firewall.mode.allowed', 'Allowed Firewall Modes', 'off|shadow|enforce'],
    ['deployment.on_prem', 'On-Prem Deployment', 'Whether on-prem is allowed'],
    ['support.sla', 'Support SLA', 'basic|premium|custom'],
    ['firewall.enabled', 'Firewall Enabled', 'Access to firewall features'],
    ['agents.invoke', 'Agent Invocation', 'Permission to invoke agents'],
  ];

  for (const [id, name, desc] of ents) {
    await ensureEntitlement(id, name, desc);
  }

  // Base plan → entitlement mapping (plan-level grants; numeric values come from user overrides or product logic)
  const planGrants: Record<string, string[]> = {
    plan_free: [
      'firewall.enabled',
      'agents.invoke',
      'explainability.level',
      'rate.rpm',
      'rate.tpm',
      'tokens.monthly_quota',
      'logs.retention_days',
    ],
    plan_pro: [
      'firewall.enabled',
      'agents.invoke',
      'explainability.level',
      'rate.rpm',
      'rate.tpm',
      'tokens.monthly_quota',
      'logs.retention_days',
      'support.sla',
    ],
    plan_enterprise: [
      'firewall.enabled',
      'agents.invoke',
      'explainability.level',
      'rate.rpm',
      'rate.tpm',
      'tokens.monthly_quota',
      'logs.retention_days',
      'support.sla',
      'deployment.on_prem',
      'firewall.mode.allowed',
    ],
  };

  for (const [planId, grants] of Object.entries(planGrants)) {
    for (const entId of grants) {
      await ensurePlanEntitlement(planId, entId);
    }
  }

  // Optional: create a default subscription for a known dev user
  const db = await getDb();
  const devUserArr = await db
    .select()
    .from(users)
    .where(eq(users.email, 'inbox@sigmacode.ai'))
    .limit(1);
  const devUser = devUserArr[0];
  if (devUser) {
    const existingSubArr = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, devUser.id))
      .limit(1);
    const existingSub = existingSubArr[0];
    if (!existingSub) {
      await db.insert(subscriptions).values({
        id: `sub_${devUser.id}`,
        userId: devUser.id,
        planId: 'plan_pro',
        status: 'active',
        startAt: new Date(),
      });
    }
  }

  console.log('Seed completed: plans, entitlements, plan_entitlements, subscriptions');
}

seed().catch((e) => {
  console.error('Seed failed', e);
  process.exit(1);
});
