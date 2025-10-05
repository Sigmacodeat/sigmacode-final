-- Add optional NextAuth-compatible columns to users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "image" text,
  ADD COLUMN IF NOT EXISTS "email_verified" timestamptz;

-- Ensure password_hash exists (idempotent with previous migration)
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_hash" text;
