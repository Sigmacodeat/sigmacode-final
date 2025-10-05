CREATE TABLE "usage_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"tokens_cost" integer NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "token_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_log" ADD CONSTRAINT "usage_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "usage_log_user_id_idx" ON "usage_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_log_timestamp_idx" ON "usage_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "usage_log_action_idx" ON "usage_log" USING btree ("action");