import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDb } from '../database/db';

async function runMigrations() {
  console.log('🚀 Starting database migration...');

  try {
    // Hole initialisierte DB-Instanz und führe Migrationen aus
    const db = await getDb();
    await migrate(db, { migrationsFolder: './database/migrations' });
    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
