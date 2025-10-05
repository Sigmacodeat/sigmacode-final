import 'dotenv/config';
import { getDb } from '../database/db';
import { firewallLogs } from '../database/schema/firewall';

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const actions = ['allow', 'block', 'shadow-allow', 'shadow-block'] as const;
const backends = ['superagent', 'dify'] as const;
const policies = ['default', 'strict', 'lenient'] as const;

async function main() {
  const db = await getDb();
  const now = Date.now();
  const rows: any[] = [];
  for (let i = 0; i < 500; i++) {
    const ts = new Date(now - i * 15_000);
    const backend = backends[Math.floor(rand(0, backends.length))];
    const policy = policies[Math.floor(rand(0, policies.length))];
    const action = actions[Math.floor(rand(0, actions.length))];
    const status = action.includes('block') ? 403 : 200;
    rows.push({
      ts: ts as any,
      requestId: `req_${(now - i).toString(36)}`,
      backend,
      policy,
      action,
      latencyMs: Math.round(rand(40, 600)),
      status,
      userId: Math.random() < 0.2 ? null : `user_${Math.floor(rand(1, 100))}`,
      meta: {
        ip: `192.168.${Math.floor(rand(0, 255))}.${Math.floor(rand(1, 254))}`,
        agentId: Math.random() < 0.5 ? `agent_${Math.floor(rand(1, 10))}` : null,
      } as any,
    });
  }

  for (let i = 0; i < rows.length; i += 200) {
    await db.insert(firewallLogs).values(rows.slice(i, i + 200));
  }
  console.log('✅ Seed Firewall done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
