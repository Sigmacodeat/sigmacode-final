import 'dotenv/config';
import { getDb } from '../database/db';
import { settings } from '../database/schema/settings';
import { users } from '../database/schema/users';
import { agents } from '../database/schema/agents';
import { and, eq, inArray } from 'drizzle-orm';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    const db = await getDb();
    // --- Demo Admin User (idempotent) ---
    const demoUserId = 'demo-user';
    const demoEmail = process.env.ADMIN_EMAIL || 'inbox@sigmacode.ai';
    console.log('👤 Ensuring demo admin user exists:', demoEmail);
    await db.delete(users).where(eq(users.id, demoUserId));
    await db.insert(users).values({
      id: demoUserId,
      email: demoEmail,
      name: 'Demo Admin',
      role: 'admin' as any,
    });

    // Standard-Einstellungen einfügen
    const defaultSettings = [
      {
        key: 'site_name',
        value: 'Sigmacode',
        type: 'string',
        groupName: 'general',
        isPublic: true,
      },
      {
        key: 'site_description',
        value: 'Eine moderne Webanwendung',
        type: 'string',
        groupName: 'general',
        isPublic: true,
      },
      {
        key: 'items_per_page',
        value: '10',
        type: 'number',
        groupName: 'pagination',
        isPublic: true,
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        groupName: 'system',
        isPublic: false,
      },
    ];

    // Lösche vorhandene Einstellungen und füge neue ein
    await db.delete(settings);
    await db.insert(settings).values(defaultSettings);

    // --- Demo Agents (idempotent by IDs) ---
    const demoAgents = [
      {
        id: 'demo-agent-dify-basic',
        ownerUserId: demoUserId,
        name: 'Dify Basic QA',
        description: 'Ein einfacher Q&A Agent, der direkt Dify nutzt (Firewall aus).',
        firewallEnabled: false,
        firewallPolicy: 'off',
        firewallConfig: null,
        modelTier: 'standard',
      },
      {
        id: 'demo-agent-superagent-enforce',
        ownerUserId: demoUserId,
        name: 'Secure Web Agent (Enforce)',
        description: 'Sicherer Web-Tool-Agent über Superagent; Firewall strikt (enforce).',
        firewallEnabled: true,
        firewallPolicy: 'strict',
        firewallConfig: {
          allowDomains: ['api.github.com', 'docs.sigmacode.ai'],
          blockPatterns: ['/(?:secret|token|apikey)/i'],
          maxInputChars: 8000,
          redactPII: true,
        },
        modelTier: 'advanced',
      },
      {
        id: 'demo-agent-shadow-compare',
        ownerUserId: demoUserId,
        name: 'Shadow Compare Agent',
        description: 'Vergleicht Antworten: Dify live, Superagent im Shadow-Mode.',
        firewallEnabled: true,
        firewallPolicy: 'basic',
        firewallConfig: {
          allowDomains: ['*'],
          maxInputChars: 6000,
          redactPII: false,
        },
        modelTier: 'standard',
      },
    ];

    console.log('🤖 Seeding demo agents (3)…');
    await db.delete(agents).where(
      inArray(
        agents.id,
        demoAgents.map((a) => a.id),
      ),
    );
    await db.insert(agents).values(demoAgents as any);

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
