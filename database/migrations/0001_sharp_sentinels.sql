CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
-- NOTE: Identity is handled idempotently in 20250919134000_settings_identity.sql; avoid duplicate sequence here
-- ALTER TABLE "settings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";