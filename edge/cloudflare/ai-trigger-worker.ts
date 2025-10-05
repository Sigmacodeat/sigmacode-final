/**
 * SigmaCode AI Trigger Worker
 * Cloudflare Worker for handling AI agent triggers, webhooks, and orchestration
 */

// Utility constants for robustness
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB limit
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Rate limiting constants
const RATE_LIMIT_REQUESTS = 100; // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_PREFIX = 'ratelimit_';

// Content type validation
const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'text/plain'
];

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Env {
  BACKEND_URL: string;
  BACKEND_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  DIFY_API_URL: string;
  AI_TRIGGERS_KV: KVNamespace;
}

interface WebhookData {
  id?: string;
  agent_id?: string;
  data?: Record<string, any>;
  query?: string;
  message?: string;
  user_id?: string;
}

interface ScheduleData {
  schedule_id: string;
  agent_id: string;
  query: string;
  inputs?: Record<string, any>;
  cron: string;
  next_run?: string;
  last_run?: string;
  status?: string;
}

interface TriggerRequest {
  trigger_type: 'webhook' | 'scheduled' | 'event' | 'manual';
  agent_id: string;
  inputs: Record<string, any>;
  query: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

interface TriggerResponse {
  status: 'success' | 'error' | 'queued';
  trigger_id: string;
  execution_id?: string;
  message: string;
  timestamp: string;
}

// Rate limiting interface
interface RateLimitData {
  count: number;
  resetTime: number;
}

// Utility Functions
function getClientIP(request: Request): string {
  // Try multiple headers for IP detection (Cloudflare specific)
  const cfIP = request.headers.get('CF-Connecting-IP');
  const forwardedIP = request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim();
  const realIP = request.headers.get('X-Real-IP');

  return cfIP || forwardedIP || realIP || 'unknown';
}

async function checkRateLimit(env: Env, clientIP: string): Promise<{ allowed: boolean; resetTime?: number }> {
  const key = `${RATE_LIMIT_PREFIX}${clientIP}`;
  const now = Date.now();
  const windowStart = Math.floor(now / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW;

  try {
    const existingData = await env.AI_TRIGGERS_KV.get(key);
    let rateData: RateLimitData;

    if (existingData) {
      rateData = JSON.parse(existingData);

      // Reset counter if window has expired
      if (now >= rateData.resetTime) {
        rateData = { count: 1, resetTime: windowStart + RATE_LIMIT_WINDOW };
      } else {
        rateData.count += 1;
      }
    } else {
      rateData = { count: 1, resetTime: windowStart + RATE_LIMIT_WINDOW };
    }

    // Check if limit exceeded
    if (rateData.count > RATE_LIMIT_REQUESTS) {
      return { allowed: false, resetTime: rateData.resetTime };
    }

    // Store updated rate limit data
    await env.AI_TRIGGERS_KV.put(key, JSON.stringify(rateData), {
      expirationTtl: Math.ceil((rateData.resetTime - now) / 1000)
    });

    return { allowed: true };
  } catch (error) {
    // If rate limiting fails, allow request but log error
    console.error('Rate limiting check failed:', error);
    return { allowed: true };
  }
}

function validateContentType(request: Request): ValidationResult<null> {
  const contentType = request.headers.get('content-type')?.split(';')[0]?.toLowerCase();

  if (!contentType) {
    return { success: true }; // Allow requests without content-type for GET requests
  }

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return {
      success: false,
      error: `Content-Type '${contentType}' not allowed. Allowed: ${ALLOWED_CONTENT_TYPES.join(', ')}`
    };
  }

  return { success: true };
}

function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).replace(/[<>'"&]/g, '');
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Rate limiting check (skip for health checks)
      if (path !== '/health') {
        const clientIP = getClientIP(request);
        const rateLimitResult = await checkRateLimit(env, clientIP);

        if (!rateLimitResult.allowed) {
          console.log('warn', 'Rate limit exceeded', { clientIP, resetTime: rateLimitResult.resetTime });
          return new Response(
            JSON.stringify({
              status: 'error',
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000),
            }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString(),
              },
            }
          );
        }
      }

      // Content-Type validation for POST requests
      if (request.method === 'POST') {
        const contentTypeValidation = validateContentType(request);
        if (!contentTypeValidation.success) {
          console.log('warn', 'Invalid content type', { contentType: request.headers.get('content-type') });
          return new Response(
            JSON.stringify({
              status: 'error',
              message: contentTypeValidation.error,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }

      // Route: Health Check
      if (path === '/health' && request.method === 'GET') {
        return new Response(
          JSON.stringify({
            status: 'healthy',
            service: 'ai-trigger-worker',
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      // Route: Trigger AI Agent
      if (path === '/api/trigger' && request.method === 'POST') {
        const triggerRequest = (await request.json()) as TriggerRequest;
        const triggerId = `trig_${crypto.randomUUID()}`;

        // Validate request
        if (!triggerRequest.agent_id || !triggerRequest.query) {
          return new Response(
            JSON.stringify({
              status: 'error',
              message: 'Missing required fields: agent_id, query',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        // Store trigger metadata in KV
        await env.AI_TRIGGERS_KV.put(
          triggerId,
          JSON.stringify({
            ...triggerRequest,
            trigger_id: triggerId,
            created_at: new Date().toISOString(),
            status: 'pending',
          }),
          { expirationTtl: 86400 }, // 24 hours
        );

        // Execute trigger asynchronously
        ctx.waitUntil(executeTrigger(env, triggerId, triggerRequest));

        const response: TriggerResponse = {
          status: 'queued',
          trigger_id: triggerId,
          message: 'Trigger queued for execution',
          timestamp: new Date().toISOString(),
        };

        return new Response(JSON.stringify(response), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: Get Trigger Status
      if (path.startsWith('/api/trigger/') && request.method === 'GET') {
        const triggerId = path.split('/').pop();
        const triggerData = await env.AI_TRIGGERS_KV.get(triggerId!);

        if (!triggerData) {
          return new Response(
            JSON.stringify({
              status: 'error',
              message: 'Trigger not found',
            }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        return new Response(triggerData, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: Webhook Handler
      if (path === '/api/webhook' && request.method === 'POST') {
        const webhookData = (await request.json()) as WebhookData;
        const triggerId = `webhook_${Date.now()}`;

        // Transform webhook data to trigger format
        const triggerRequest: TriggerRequest = {
          trigger_type: 'webhook',
          agent_id: webhookData.agent_id || 'default-agent',
          inputs: webhookData.data || {},
          query: webhookData.query || webhookData.message || 'Webhook trigger',
          user_id: webhookData.user_id,
          metadata: {
            source: 'webhook',
            webhook_id: webhookData.id,
            headers: Object.fromEntries(request.headers),
          },
        };

        ctx.waitUntil(executeTrigger(env, triggerId, triggerRequest));

        return new Response(
          JSON.stringify({
            status: 'success',
            trigger_id: triggerId,
            message: 'Webhook received and queued',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      // Route: Scheduled Trigger (Cron)
      if (path === '/api/scheduled' && request.method === 'POST') {
        const scheduleData = (await request.json()) as ScheduleData;

        // Store scheduled trigger
        await env.AI_TRIGGERS_KV.put(
          `schedule_${scheduleData.schedule_id}`,
          JSON.stringify({
            ...scheduleData,
            next_run: calculateNextRun(scheduleData.cron),
            status: 'active',
          }),
        );

        return new Response(
          JSON.stringify({
            status: 'success',
            message: 'Scheduled trigger created',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      // 404
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Route not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }
  },

  // Cron Handler for scheduled triggers
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Cron trigger at:', new Date(event.scheduledTime).toISOString());

    // Get all scheduled triggers
    const list = await env.AI_TRIGGERS_KV.list({ prefix: 'schedule_' });

    for (const key of list.keys) {
      const scheduleData = await env.AI_TRIGGERS_KV.get(key.name);
      if (!scheduleData) continue;

      const schedule = JSON.parse(scheduleData);
      const now = Date.now();
      const nextRun = new Date(schedule.next_run).getTime();

      if (now >= nextRun && schedule.status === 'active') {
        const triggerRequest: TriggerRequest = {
          trigger_type: 'scheduled',
          agent_id: schedule.agent_id,
          inputs: schedule.inputs || {},
          query: schedule.query,
          metadata: {
            schedule_id: schedule.schedule_id,
            cron: schedule.cron,
          },
        };

        ctx.waitUntil(executeTrigger(env, `sched_${now}`, triggerRequest));

        // Update next run
        schedule.next_run = calculateNextRun(schedule.cron);
        schedule.last_run = new Date().toISOString();
        await env.AI_TRIGGERS_KV.put(key.name, JSON.stringify(schedule));
      }
    }
  },
};

async function executeTrigger(
  env: Env,
  triggerId: string,
  triggerRequest: TriggerRequest,
): Promise<void> {
  const startTime = Date.now();
  console.log(`Starting trigger execution: ${triggerId}`);

  try {
    // Add timeout to the backend request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT); // 30 second timeout

    const response = await fetch(`${env.BACKEND_URL}/api/agents/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.BACKEND_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: triggerRequest.agent_id,
        inputs: triggerRequest.inputs,
        query: triggerRequest.query,
        user: triggerRequest.user_id || 'trigger-system',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let result: any;
    try {
      const responseText = await response.text();
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`Failed to parse response for ${triggerId}:`, parseError);
      result = { status: 'error', message: 'Invalid response format' };
    }

    // Update trigger status with retry logic
    const triggerData = await env.AI_TRIGGERS_KV.get(triggerId);
    if (triggerData) {
      const trigger = JSON.parse(triggerData);
      trigger.status = response.ok ? 'completed' : 'failed';
      trigger.execution_id = result.request_id;
      trigger.completed_at = new Date().toISOString();
      trigger.result = result;
      trigger.duration_ms = Date.now() - startTime;
      await env.AI_TRIGGERS_KV.put(triggerId, JSON.stringify(trigger));
    }

    console.log(`Trigger ${triggerId} executed in ${Date.now() - startTime}ms:`, response.status);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Trigger ${triggerId} failed after ${duration}ms:`, error);

    // Update trigger status to failed
    try {
      const triggerData = await env.AI_TRIGGERS_KV.get(triggerId);
      if (triggerData) {
        const trigger = JSON.parse(triggerData);
        trigger.status = 'failed';
        trigger.error = error instanceof Error ? error.message : 'Unknown error';
        trigger.failed_at = new Date().toISOString();
        trigger.duration_ms = duration;
        await env.AI_TRIGGERS_KV.put(triggerId, JSON.stringify(trigger));
      }
    } catch (updateError) {
      console.error(`Failed to update trigger status for ${triggerId}:`, updateError);
    }
  }
}

function calculateNextRun(cron: string): string {
  // Simple next run calculation (you can use a cron library for production)
  // For now, default to 1 hour from now
  const next = new Date();
  next.setHours(next.getHours() + 1);
  return next.toISOString();
}
