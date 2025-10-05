/**
 * SIGMACODE AI - Environment Variable Validation
 * 
 * Validiert alle ENV-Variablen beim Start und verhindert Runtime-Fehler.
 * Nutzt Zod für Type-Safety und t3-env für Next.js Integration.
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side Environment Variables
   * Nur auf dem Server verfügbar, niemals im Browser
   */
  server: {
    // Database
    DATABASE_URL: z.string().url().optional(),
    POSTGRES_HOST: z.string().optional(),
    POSTGRES_PORT: z.string().optional(),
    POSTGRES_DB: z.string().optional(),
    POSTGRES_USER: z.string().optional(),
    POSTGRES_PASSWORD: z.string().optional(),

    // Authentication
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(32),

    // JWT
    JWT_SECRET: z.string().min(32),

    // OAuth Providers
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),

    // Dify Integration
    DIFY_API_URL: z.string().url().optional(),
    DIFY_API_KEY: z.string().optional(),

    // Firewall (Superagent/Sigmaguard)
    FIREWALL_ENABLED: z.enum(['true', 'false']).optional(),
    FIREWALL_MODE: z.enum(['enforce', 'shadow', 'off']).optional(),
    SUPERAGENT_URL: z.string().url().optional(),
    SUPERAGENT_API_KEY: z.string().optional(),
    SIGMAGUARD_URL: z.string().url().optional(),
    SIGMAGUARD_API_KEY: z.string().optional(),

    // Stripe Billing
    STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
    STRIPE_PRICE_STARTER_MONTHLY: z.string().optional(),
    STRIPE_PRICE_STARTER_YEARLY: z.string().optional(),
    STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
    STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
    STRIPE_PRICE_BUSINESS_MONTHLY: z.string().optional(),
    STRIPE_PRICE_BUSINESS_YEARLY: z.string().optional(),

    // Email (Resend)
    RESEND_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),

    // Monitoring
    SENTRY_DSN: z.string().url().optional(),

    // Vault
    VAULT_ADDR: z.string().url().optional(),
    VAULT_TOKEN: z.string().optional(),

    // Redis
    REDIS_URL: z.string().url().optional(),
    REDIS_PASSWORD: z.string().optional(),

    // Node Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },

  /**
   * Client-side Environment Variables
   * Verfügbar im Browser, prefixed mit NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_EUR_TO_USD: z.string().optional(),
    NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_GTM_ID: z.string().optional(),
  },

  /**
   * Runtime Environment Variables
   * Mapping zwischen .env und process.env
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,

    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,

    JWT_SECRET: process.env.JWT_SECRET,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,

    DIFY_API_URL: process.env.DIFY_API_URL,
    DIFY_API_KEY: process.env.DIFY_API_KEY,

    FIREWALL_ENABLED: process.env.FIREWALL_ENABLED,
    FIREWALL_MODE: process.env.FIREWALL_MODE,
    SUPERAGENT_URL: process.env.SUPERAGENT_URL,
    SUPERAGENT_API_KEY: process.env.SUPERAGENT_API_KEY,
    SIGMAGUARD_URL: process.env.SIGMAGUARD_URL,
    SIGMAGUARD_API_KEY: process.env.SIGMAGUARD_API_KEY,

    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_STARTER_MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    STRIPE_PRICE_STARTER_YEARLY: process.env.STRIPE_PRICE_STARTER_YEARLY,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_PRICE_PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY,
    STRIPE_PRICE_BUSINESS_MONTHLY: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    STRIPE_PRICE_BUSINESS_YEARLY: process.env.STRIPE_PRICE_BUSINESS_YEARLY,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,

    SENTRY_DSN: process.env.SENTRY_DSN,

    VAULT_ADDR: process.env.VAULT_ADDR,
    VAULT_TOKEN: process.env.VAULT_TOKEN,

    REDIS_URL: process.env.REDIS_URL,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_EUR_TO_USD: process.env.NEXT_PUBLIC_EUR_TO_USD,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  },

  /**
   * Skip Validation in bestimmten Umgebungen
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Empty String als undefined behandeln
   */
  emptyStringAsUndefined: true,
});
