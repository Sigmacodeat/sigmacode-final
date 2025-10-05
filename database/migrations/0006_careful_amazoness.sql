ALTER TABLE "alerts" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "alerts" ADD COLUMN "resolved_by" varchar(64);--> statement-breakpoint
ALTER TABLE "alerts" ADD COLUMN "resolved_reason" text;