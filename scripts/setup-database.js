const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema.sql');

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🔍 Checking for existing migrations...');

    // Prüfen, ob die migrations Tabelle existiert
    const hasMigrationsTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_migrations'
      );
    `);

    if (!hasMigrationsTable.rows[0].exists) {
      console.log('ℹ️  Creating migrations table...');
      await client.query(`
        CREATE TABLE _migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          run_on TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
    }

    // Prüfen, ob das Schema existiert
    if (fs.existsSync(SCHEMA_PATH)) {
      console.log('📄 Loading schema file...');
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

      console.log('🚀 Running schema migrations...');
      await client.query(schema);

      console.log('✅ Database schema updated successfully!');
    } else {
      console.log('⚠️  No schema file found. Skipping schema migration.');
    }

    await client.query('COMMIT');
    console.log('✨ Database setup completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error setting up database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Hauptfunktion
async function main() {
  try {
    console.log('🚀 Starting database setup...');
    await runMigrations();
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  }
}

main();
