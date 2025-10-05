import { getDbConfig } from '../database/db';

async function testVaultIntegration() {
  try {
    const config = await getDbConfig();
    console.log('✅ Vault-Integration erfolgreich!');
    console.log('DB Konfiguration:', config);
  } catch (error) {
    console.error('❌ Fehler bei Vault-Integration:', error);
  }
}

testVaultIntegration();
