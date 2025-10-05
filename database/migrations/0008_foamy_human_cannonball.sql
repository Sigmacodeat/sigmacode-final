CREATE TABLE "workflow_executions" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"status" text NOT NULL,
	"error" text,
	"firewall_pre_check" jsonb,
	"firewall_post_check" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"duration" integer,
	"logs" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_tools" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"config" jsonb NOT NULL,
	"icon" text,
	"description" text,
	"requires_auth" boolean DEFAULT false NOT NULL,
	"auth_type" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_tools_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"definition" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_config" jsonb,
	"timeout" integer DEFAULT 300 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"execution_count" integer DEFAULT 0 NOT NULL,
	"last_executed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workflow_executions_workflow_id_idx" ON "workflow_executions" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workflow_executions_created_at_idx" ON "workflow_executions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "workflow_tools_category_idx" ON "workflow_tools" USING btree ("category");--> statement-breakpoint
CREATE INDEX "workflow_tools_is_enabled_idx" ON "workflow_tools" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "workflows_agent_id_idx" ON "workflows" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "workflows_owner_user_id_idx" ON "workflows" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "workflows_is_active_idx" ON "workflows" USING btree ("is_active");