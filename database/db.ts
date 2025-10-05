import { Pool, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

type VaultDbConfig = {
  host?: string;
  port?: string | number;
  database?: string;
  username?: string;
  password?: string;
  ssl_ca?: string; // optional CA im Base64/String-Format
};

function normalizePort(p?: string | number): number | undefined {
  if (p === undefined) return undefined;
  const n = typeof p === 'number' ? p : parseInt(String(p), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function maybeDecodeBase64Pem(input?: string): string | undefined {
  if (!input) return input;
  // Wenn bereits eine PEM-Struktur erkennbar ist, unverändert zurückgeben
  if (input.includes('-----BEGIN')) return input;
  try {
    const decoded = Buffer.from(input, 'base64').toString('utf-8');
    // Nur wenn ein plausibles PEM vorliegt, verwenden
    if (decoded.includes('-----BEGIN')) return decoded;
  } catch {
    // ignorieren – kein gültiges Base64
  }
  return input;
}

async function loadDbConfigFromVault(): Promise<VaultDbConfig | null> {
  const VAULT_ADDR = process.env.VAULT_ADDR;
  const VAULT_TOKEN = process.env.VAULT_TOKEN;
  const SECRET_PATH = process.env.VAULT_DB_SECRET_PATH || 'secret/data/database/config';

  if (!VAULT_ADDR || !VAULT_TOKEN) return null;

  // Importiere node-vault nur, wenn benötigt. Mit webpackIgnore, damit der Build nicht fehlschlägt, wenn das Paket fehlt.
  const nodeVaultModule = await import(/* webpackIgnore: true */ 'node-vault')
    .then((m) => (m as any).default ?? m)
    .catch(() => null);
  if (!nodeVaultModule) {
    console.warn(
      '[db] VAULT_* Umgebungsvariablen gesetzt, aber "node-vault" ist nicht installiert. Fallback auf ENV-Konfiguration.',
    );
    return null;
  }

  try {
    const vault = nodeVaultModule({
      apiVersion: 'v1',
      endpoint: VAULT_ADDR,
      token: VAULT_TOKEN,
    });
    const res = await vault.read(SECRET_PATH);
    const data: any = res?.data?.data || {};
    return {
      host: data.host,
      port: normalizePort(data.port),
      database: data.database,
      username: data.username,
      password: data.password,
      ssl_ca: maybeDecodeBase64Pem(data.ssl_ca),
    };
  } catch (err) {
    console.warn(
      '[db] Konnte DB-Konfiguration nicht aus Vault laden. Fallback auf ENV.',
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

function buildPoolConfig(vaultCfg: VaultDbConfig | null): PoolConfig {
  const useUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL; // bevorzugte Connection-URL

  const base: PoolConfig = useUrl
    ? {
        connectionString: useUrl,
      }
    : {
        host: process.env.POSTGRES_HOST || vaultCfg?.host || 'localhost',
        port: parseInt(String(process.env.POSTGRES_PORT || vaultCfg?.port || '5432'), 10),
        database: process.env.POSTGRES_DB || vaultCfg?.database || 'sigmacode_dev',
        user: process.env.POSTGRES_USER || vaultCfg?.username || 'postgres',
        password: process.env.POSTGRES_PASSWORD || vaultCfg?.password || 'postgres',
      };

  // SSL nur in Production standardmäßig aktivieren; CA optional
  const sslEnabled =
    process.env.PGSSL?.toLowerCase() === 'true' || process.env.NODE_ENV === 'production';
  if (sslEnabled) {
    (base as any).ssl = {
      rejectUnauthorized: false,
      // Optional: CA nutzen, wenn aus Vault geliefert
      ca: vaultCfg?.ssl_ca,
    } as any;
  } else {
    (base as any).ssl = false as any;
  }

  // sinnvolle Pool Defaults
  base.max = Number(process.env.PG_POOL_MAX || 20);
  base.idleTimeoutMillis = Number(process.env.PG_IDLE_TIMEOUT || 30_000);
  base.connectionTimeoutMillis = Number(process.env.PG_CONN_TIMEOUT || 5_000);

  return base;
}

let pool: Pool | undefined;
let db: NodePgDatabase<typeof schema> | undefined;

async function init() {
  const vaultCfg = await loadDbConfigFromVault();
  const cfg = buildPoolConfig(vaultCfg);
  pool = new Pool(cfg);
  db = drizzle(pool as Pool, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  }) as NodePgDatabase<typeof schema>;
}

export async function checkDatabaseConnection() {
  if (!pool) return { success: false, error: 'Pool not initialized' } as const;
  try {
    const client = await (pool as Pool).connect();
    await client.query('SELECT 1');
    client.release();
    return { success: true } as const;
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as const;
  }
}

// Für Call-Sites, die explizit warten möchten
export async function getDb(): Promise<NodePgDatabase<typeof schema>> {
  if (!db) {
    await init();
  }
  return db as NodePgDatabase<typeof schema>;
}

// Falls direkte Nutzung erfolgt, bewusst undefined bis zur Initialisierung
export { db };

export async function getDbConfig() {
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

// Liefert synchron eine Drizzle-Instanz für Adapter (z. B. NextAuth),
// ohne Vault und ohne aktiven Verbindungsaufbau. Verbindungsaufbau erfolgt erst bei erster Query.
export function getDrizzleForAdapter(): NodePgDatabase<typeof schema> {
  const cfg = buildPoolConfig(null);
  const localPool = new Pool(cfg);
  const localDb = drizzle(localPool, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });
  return localDb as NodePgDatabase<typeof schema>;
}
