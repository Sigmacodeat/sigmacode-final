const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkTables() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking database tables...\n');
    const expectedTables = [
      'users',
      'sessions',
      'posts',
      'categories',
      'tags',
      'comments',
      'likes',
      'media',
      'settings',
    ];
    const res = await client.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public'
       ORDER BY table_name`,
    );
    const existingTables = res.rows.map((r) => r.table_name);
    const missingTables = expectedTables.filter((t) => !existingTables.includes(t));
    const extraTables = existingTables.filter((t) => !expectedTables.includes(t));

    console.log('✅ Existing tables:');
    console.log(existingTables.length > 0 ? existingTables.join(', ') : 'No tables found');

    if (missingTables.length > 0) {
      console.log('\n❌ Missing tables:');
      console.log(missingTables.join(', '));
    }

    if (extraTables.length > 0) {
      console.log('\nℹ️  Extra tables (not in expected list):');
      console.log(extraTables.join(', '));
    }

    return {
      success: missingTables.length === 0,
      existingTables,
      missingTables,
      extraTables,
    };
  } catch (err) {
    console.error('❌ Error checking tables:', err.message);
    return { success: false, error: err.message };
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables().then(({ success }) => {
  console.log(
    '\n' +
      (success
        ? '✅ Database schema check completed successfully!'
        : '❌ Some tables are missing.'),
  );
  process.exit(success ? 0 : 1);
});
