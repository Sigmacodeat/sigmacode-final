const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// List of possible database hosts and ports from running containers
const dbConfigs = [
  { host: 'localhost', port: 5432, description: 'Default PostgreSQL' },
  { host: 'localhost', port: 5433, description: 'Infra DB' },
  { host: 'localhost', port: 5435, description: 'Sim DB' },
  { host: 'db', port: 5432, description: 'Docker Dify DB' },
  { host: 'localhost', port: 55432, description: 'SaaS BP PostgreSQL' },
  { host: 'localhost', port: 55433, description: 'Dify DB' },
];

async function testConnection(config) {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 2000, // 2 seconds timeout
    query_timeout: 2000,
  });

  const client = await pool.connect().catch((err) => {
    console.log(`❌ [${config.description}] Connection failed: ${err.message}`);
    return null;
  });

  if (!client) return false;

  try {
    console.log(
      `\n🔍 Testing connection to ${config.description} (${config.host}:${config.port})...`,
    );

    // Test basic connection
    const version = await client.query('SELECT version()');
    console.log(
      `✅ [${config.description}] Connected to PostgreSQL ${version.rows[0].version.split(' ')[1]}`,
    );

    // List available databases
    const dbs = await client.query(
      `SELECT datname FROM pg_database 
       WHERE datistemplate = false 
       AND datname NOT IN ('postgres', 'template0', 'template1')
       ORDER BY datname`,
    );

    console.log(
      `📊 [${config.description}] Available databases:`,
      dbs.rows.map((r) => r.datname).join(', ') || 'None found',
    );

    return true;
  } catch (err) {
    console.error(`❌ [${config.description}] Error:`, err.message);
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}

async function testAllConnections() {
  console.log('🔍 Scanning for PostgreSQL databases...\n');

  let success = false;
  for (const config of dbConfigs) {
    success = (await testConnection(config)) || success;
  }

  if (!success) {
    console.log('\n❌ No database connections were successful. Please check your configuration.');
    console.log('   Make sure the database is running and the credentials are correct.');
    console.log('   You can check running containers with: docker ps');
  } else {
    console.log('\n✅ Database scan completed successfully!');
  }
}

testAllConnections();
