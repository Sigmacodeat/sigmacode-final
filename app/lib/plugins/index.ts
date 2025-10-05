import type { PluginRequest, PluginResult, ProviderAdapter } from './types';
import { getFeatureFlags } from './featureFlags';
import { openAIAdapter } from './adapters/openai';
import { openRouterAdapter } from './adapters/openrouter';

const providers: Record<string, ProviderAdapter> = {
  openai: openAIAdapter,
  openrouter: openRouterAdapter,
};

export async function routePluginRequest(request: PluginRequest): Promise<PluginResult> {
  const flags = getFeatureFlags();
  if (!flags.DIFY_PLUGIN_PROXY) {
    throw Object.assign(new Error('Plugin proxy disabled'), { statusCode: 403 });
  }

  const key = request.provider?.toLowerCase();
  const adapter = providers[key];
  if (!adapter) {
    throw Object.assign(new Error(`Unknown provider: ${request.provider}`), { statusCode: 400 });
  }
  return adapter.handle(request);
}
