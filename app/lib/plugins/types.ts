export type FirewallMode = 'off' | 'shadow' | 'enforce';

export interface PluginRequest {
  provider: string;
  action: string;
  body: any;
  headers: Record<string, string>;
  requestId: string;
  tenantId: string | null;
  locale?: string;
  firewallMode?: FirewallMode;
}

export interface PluginResult<T = any> {
  data: T;
  meta?: Record<string, any>;
}

export interface ProviderAdapter {
  handle(request: PluginRequest): Promise<PluginResult>;
}
