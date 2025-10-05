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

async function getTableStructure(tableName) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      SELECT column_name, data_type, character_maximum_length, 
             column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `,
      [tableName],
    );

    return res.rows;
  } finally {
    client.release();
  }
}

async function main() {
  const tables = ['users', 'sessions', 'media', 'settings'];

  for (const table of tables) {
    console.log(`\n📋 Table: ${table}`);
    console.log('='.repeat(50));

    try {
      const structure = await getTableStructure(table);
      if (structure.length === 0) {
        console.log(`Table '${table}' does not exist.`);
      } else {
        console.table(structure);
      }
    } catch (err) {
      console.error(`Error checking table '${table}':`, err.message);
    }
  }

  await pool.end();
}

main().catch(console.error);
