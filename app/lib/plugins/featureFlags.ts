export function getFeatureFlags() {
  return {
    DIFY_PLUGIN_PROXY:
      process.env.DIFY_PLUGIN_PROXY === '1' || process.env.DIFY_PLUGIN_PROXY === 'true',
    FIREWALL_MODE: (process.env.FIREWALL_MODE as 'off' | 'shadow' | 'enforce') || 'shadow',
  } as const;
}
