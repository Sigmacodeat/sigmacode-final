require('dotenv').config();
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const db = drizzle(pool);
  
  console.log('Starting migration...');
  await migrate(db, { migrationsFolder: './database/migrations' });
  console.log('Migration completed!');
  
  await pool.end();
}

runMigration().catch(console.error);
