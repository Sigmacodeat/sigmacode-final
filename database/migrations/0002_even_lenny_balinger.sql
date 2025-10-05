CREATE TYPE "public"."dac_permission" AS ENUM('read', 'write', 'delete', 'share', 'admin');--> statement-breakpoint
CREATE TYPE "public"."dac_resource_type" AS ENUM('dataset', 'workflow', 'agent', 'document', 'project', 'folder');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'editor' BEFORE 'admin';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'service';--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"firewall_enabled" boolean DEFAULT false NOT NULL,
	"firewall_policy" text DEFAULT 'off' NOT NULL,
	"firewall_config" jsonb,
	"model_tier" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_errors_by_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"type" varchar(64) NOT NULL,
	"count" integer NOT NULL,
	"percentage" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_errors_recent" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"message" text NOT NULL,
	"endpoint" varchar(256) NOT NULL,
	"user_agent" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_errors_trends" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(10) NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_overview" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"total_requests" integer NOT NULL,
	"active_users" integer NOT NULL,
	"avg_response_time_ms" integer NOT NULL,
	"error_rate" double precision NOT NULL,
	"uptime" double precision NOT NULL,
	"throughput" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_performance_timeseries" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"metric" varchar(32) NOT NULL,
	"value" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_system_health" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"cpu_usage" double precision NOT NULL,
	"memory_usage" double precision NOT NULL,
	"disk_usage" double precision NOT NULL,
	"network_io" double precision NOT NULL,
	"active_connections" integer NOT NULL,
	"cache_hit_rate" double precision NOT NULL,
	"extra" jsonb
);
--> statement-breakpoint
CREATE TABLE "analytics_usage_by_country" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"country" varchar(64) NOT NULL,
	"requests" integer NOT NULL,
	"flag" varchar(8) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_usage_by_endpoint" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"endpoint" varchar(256) NOT NULL,
	"requests" integer NOT NULL,
	"avg_time_ms" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_usage_by_hour" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"hour" integer NOT NULL,
	"requests" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_usage_by_user_agent" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"agent" varchar(128) NOT NULL,
	"count" integer NOT NULL,
	"percentage" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text,
	"actor_type" text NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"payload" jsonb,
	"previous_hash" text,
	"hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dac_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"resource_type" "dac_resource_type" NOT NULL,
	"resource_id" text NOT NULL,
	"permission" "dac_permission" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firewall_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" varchar(64) NOT NULL,
	"backend" varchar(64) NOT NULL,
	"policy" varchar(128) NOT NULL,
	"action" varchar(32) NOT NULL,
	"latency_ms" integer NOT NULL,
	"status" integer NOT NULL,
	"user_id" varchar(64),
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_monthly" numeric(10, 2) NOT NULL,
	"price_yearly" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" text NOT NULL,
	"start_at" timestamp with time zone DEFAULT now() NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"external_customer_id" text,
	"external_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_entitlements" (
	"plan_id" text NOT NULL,
	"entitlement_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_entitlements_pk" PRIMARY KEY("plan_id","entitlement_id")
);
--> statement-breakpoint
CREATE TABLE "user_entitlements" (
	"user_id" text NOT NULL,
	"entitlement_id" text NOT NULL,
	"value" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_entitlements_pk" PRIMARY KEY("user_id","entitlement_id")
);
--> statement-breakpoint
-- NOTE: Identity/sequence handling for settings.id is done in 20250919134000_settings_identity.sql (idempotent)
-- The following non-idempotent ALTERs are removed to avoid duplicate_object errors on fresh DBs
-- ALTER TABLE "settings" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
-- ALTER TABLE "settings" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_entitlements" ADD CONSTRAINT "plan_entitlements_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_entitlements" ADD CONSTRAINT "plan_entitlements_entitlement_id_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_entitlements" ADD CONSTRAINT "user_entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_entitlements" ADD CONSTRAINT "user_entitlements_entitlement_id_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "agents_owner_user_id_idx" ON "agents" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "agents_name_idx" ON "agents" USING btree ("name");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_type","actor_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_resource_idx" ON "audit_log" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dac_permissions_user_id_idx" ON "dac_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dac_permissions_resource_type_idx" ON "dac_permissions" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "dac_permissions_resource_id_idx" ON "dac_permissions" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "dac_permissions_active_idx" ON "dac_permissions" USING btree ("active");--> statement-breakpoint
CREATE INDEX "dac_permissions_composite_idx" ON "dac_permissions" USING btree ("user_id","resource_type","resource_id","active");--> statement-breakpoint
CREATE INDEX "entitlements_active_idx" ON "entitlements" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "verification_tokens_identifier_idx" ON "verification_tokens" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "plans_active_idx" ON "plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "plan_entitlements_plan_id_idx" ON "plan_entitlements" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "plan_entitlements_entitlement_id_idx" ON "plan_entitlements" USING btree ("entitlement_id");--> statement-breakpoint
CREATE INDEX "user_entitlements_user_id_idx" ON "user_entitlements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_entitlements_entitlement_id_idx" ON "user_entitlements" USING btree ("entitlement_id");