CREATE TABLE "ai_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"provider_type" varchar(64) NOT NULL,
	"base_url" varchar(512),
	"api_key" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"rate_limits" jsonb DEFAULT '{}'::jsonb,
	"token_costs" jsonb DEFAULT '{}'::jsonb,
	"models" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"user_id" text,
	"provider_id" text NOT NULL,
	"model" varchar(128) NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"total_tokens" integer NOT NULL,
	"cost" numeric(10, 6),
	"request_type" varchar(32) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "tenant_id" text DEFAULT 'global' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenant_id" text DEFAULT 'global' NOT NULL;--> statement-breakpoint
CREATE INDEX "ai_providers_tenant_idx" ON "ai_providers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_providers_type_idx" ON "ai_providers" USING btree ("provider_type");--> statement-breakpoint
CREATE INDEX "ai_providers_active_idx" ON "ai_providers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "token_usage_tenant_idx" ON "token_usage" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "token_usage_provider_idx" ON "token_usage" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "token_usage_model_idx" ON "token_usage" USING btree ("model");--> statement-breakpoint
CREATE INDEX "token_usage_created_at_idx" ON "token_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "accounts_tenant_idx" ON "accounts" USING btree ("tenant_id");