import type { PluginRequest, PluginResult, ProviderAdapter } from '../types';

async function handleChat(req: PluginRequest): Promise<PluginResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const err: any = new Error('OPENROUTER_API_KEY missing');
    err.statusCode = 500;
    throw err;
  }

  const { body } = req;
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // Optional recommended headers for OpenRouter context. Replace with your own values if desired.
      // "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
      // "X-Title": "SIGMACODE AI",
      'X-Request-Id': req.requestId,
    },
    body: JSON.stringify({
      model: body?.model || 'openrouter/auto',
      messages: body?.messages || [],
      temperature: body?.temperature ?? 0.7,
      stream: false,
    }),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    const err: any = new Error(`OpenRouter error: ${r.status} ${text}`);
    err.statusCode = r.status;
    throw err;
  }

  const data = await r.json();
  return { data };
}

export const openRouterAdapter: ProviderAdapter = {
  async handle(req: PluginRequest) {
    switch (req.action) {
      case 'chat':
        return handleChat(req);
      default: {
        const err: any = new Error(`Unsupported action for openrouter: ${req.action}`);
        err.statusCode = 400;
        throw err;
      }
    }
  },
};
