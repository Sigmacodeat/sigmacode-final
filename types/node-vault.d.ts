declare module 'node-vault' {
  // Minimaltypisierung für node-vault. Wir typisieren als any, da das Paket keine offiziellen Typen mitliefert
  // und die Nutzung bei uns dynamisch und optional erfolgt.
  interface NodeVaultConfig {
    apiVersion?: string;
    endpoint?: string;
    token?: string;
  }

  type VaultClient = {
    read: (path: string) => Promise<any>;
    write?: (path: string, data: any) => Promise<any>;
    [key: string]: any;
  };

  function nodeVault(config?: NodeVaultConfig): VaultClient;
  export default nodeVault;
}
