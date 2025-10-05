/**
 * SigmaCode AI Trigger Worker
 * Cloudflare Worker for handling AI agent triggers, webhooks, and orchestration
 */

interface Env {
  BACKEND_URL: string;
  BACKEND_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  DIFY_API_URL: string;
  AI_TRIGGERS_KV: KVNamespace;
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
        const triggerId = `trig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
  try {
    const response = await fetch(`${env.BACKEND_URL}/api/agents/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.BACKEND_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: triggerRequest.agent_id,
        inputs: triggerRequest.inputs,
        query: triggerRequest.query,
        user: triggerRequest.user_id || 'trigger-system',
      }),
    });

    const result = (await response.json()) as APIResponse;

    // Update trigger status
    const triggerData = await env.AI_TRIGGERS_KV.get(triggerId);
    if (triggerData) {
      const trigger = JSON.parse(triggerData);
      trigger.status = response.ok ? 'completed' : 'failed';
      trigger.execution_id = result.request_id;
      trigger.completed_at = new Date().toISOString();
      trigger.result = result;
      await env.AI_TRIGGERS_KV.put(triggerId, JSON.stringify(trigger));
    }

    console.log(`Trigger ${triggerId} executed:`, response.status);
  } catch (error) {
    console.error(`Trigger ${triggerId} failed:`, error);

    // Update trigger status to failed
    const triggerData = await env.AI_TRIGGERS_KV.get(triggerId);
    if (triggerData) {
      const trigger = JSON.parse(triggerData);
      trigger.status = 'failed';
      trigger.error = error instanceof Error ? error.message : 'Unknown error';
      trigger.failed_at = new Date().toISOString();
      await env.AI_TRIGGERS_KV.put(triggerId, JSON.stringify(trigger));
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
