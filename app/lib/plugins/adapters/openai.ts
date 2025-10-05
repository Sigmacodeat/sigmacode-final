import type { PluginRequest, PluginResult, ProviderAdapter } from '../types';

async function handleChat(req: PluginRequest): Promise<PluginResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err: any = new Error('OPENAI_API_KEY missing');
    err.statusCode = 500;
    throw err;
  }

  const { body } = req;
  // Expecting body to include model and messages according to OpenAI v1 chat completions
  const url = 'https://api.openai.com/v1/chat/completions';

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Request-Id': req.requestId,
    },
    body: JSON.stringify({
      model: body?.model || 'gpt-4o-mini',
      messages: body?.messages || [],
      temperature: body?.temperature ?? 0.7,
      stream: false,
    }),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    const err: any = new Error(`OpenAI error: ${r.status} ${text}`);
    err.statusCode = r.status;
    throw err;
  }

  const data = await r.json();
  return { data };
}

export const openAIAdapter: ProviderAdapter = {
  async handle(req: PluginRequest) {
    switch (req.action) {
      case 'chat':
        return handleChat(req);
      default: {
        const err: any = new Error(`Unsupported action for openai: ${req.action}`);
        err.statusCode = 400;
        throw err;
      }
    }
  },
};
