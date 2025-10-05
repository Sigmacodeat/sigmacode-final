export type FirewallMode = 'enforce' | 'shadow' | 'off';

type RuntimeConfig = {
  enabled: boolean;
  mode: FirewallMode;
};

let runtimeConfig: RuntimeConfig = {
  enabled: (process.env.FIREWALL_ENABLED || 'true').toLowerCase() === 'true',
  mode: (process.env.FIREWALL_MODE as FirewallMode) || 'enforce',
};

export function getFirewallRuntimeConfig(): RuntimeConfig {
  return runtimeConfig;
}

export function setFirewallRuntimeConfig(update: Partial<RuntimeConfig>): RuntimeConfig {
  runtimeConfig = { ...runtimeConfig, ...update };
  return runtimeConfig;
}
