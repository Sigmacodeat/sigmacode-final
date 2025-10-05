import 'dotenv/config';
import { Client } from 'pg';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

async function run() {
  const url = process.env.DATABASE_URL || process.env.DRIZZLE_DATABASE_URL;
  if (!url) {
    console.error('No DATABASE_URL/DRIZZLE_DATABASE_URL set');
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  await client.query('BEGIN');
  await client.query(
    'CREATE TABLE IF NOT EXISTS public.__migrations (id serial primary key, filename text unique not null, applied_at timestamptz not null default now())',
  );
  await client.query('COMMIT');

  const dir = join(process.cwd(), 'database', 'migrations');
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rows } = await client.query('SELECT 1 FROM public.__migrations WHERE filename = $1', [
      file,
    ]);
    if (rows.length) {
      console.log(`⏭️  Skipping already applied: ${file}`);
      continue;
    }
    const sql = readFileSync(join(dir, file), 'utf8');
    console.log(`▶️  Applying ${file} ...`);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO public.__migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✅ Applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed ${file}:`, err instanceof Error ? err.message : err);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('🏁 Migrations complete');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
