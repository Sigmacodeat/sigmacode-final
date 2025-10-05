-- Add NextAuth-related optional fields to users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "image" text,
  ADD COLUMN IF NOT EXISTS "email_verified" timestamptz;

-- Helpful index on email already exists (users_email_idx)
-- Role index exists (users_role_idx)
