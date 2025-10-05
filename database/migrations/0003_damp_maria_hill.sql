CREATE TABLE "api_key_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"api_key_id" text NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"token_count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"key_id" varchar(64) NOT NULL,
	"hashed_key" text NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(128),
	"scopes" jsonb,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"rate_limit_rpm" integer DEFAULT 60,
	"rate_limit_tpm" integer DEFAULT 100000,
	"quota_limit" integer DEFAULT 1000000,
	"quota_used" integer DEFAULT 0,
	"quota_reset_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_id_unique" UNIQUE("key_id")
);
--> statement-breakpoint
CREATE TABLE "threat_signatures" (
	"id" text PRIMARY KEY NOT NULL,
	"category" varchar(64) NOT NULL,
	"pattern" text NOT NULL,
	"severity" varchar(32) NOT NULL,
	"description" text,
	"source" varchar(128),
	"version" varchar(32) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_token_unique";--> statement-breakpoint
DROP INDEX "sessions_user_id_idx";--> statement-breakpoint
DROP INDEX "sessions_token_idx";--> statement-breakpoint
-- Drop existing primary key on sessions (from initial schema) before adding a new one
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey";--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "session_token" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "expires" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key_usage" ADD CONSTRAINT "api_key_usage_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_key_usage_api_key_id_idx" ON "api_key_usage" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "api_key_usage_window_idx" ON "api_key_usage" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_status_idx" ON "api_keys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "api_keys_key_id_idx" ON "api_keys" USING btree ("key_id");--> statement-breakpoint
CREATE INDEX "threat_signatures_category_idx" ON "threat_signatures" USING btree ("category");--> statement-breakpoint
CREATE INDEX "threat_signatures_severity_idx" ON "threat_signatures" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "threat_signatures_active_idx" ON "threat_signatures" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "threat_signatures_source_idx" ON "threat_signatures" USING btree ("source");--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "updated_at";