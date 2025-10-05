-- Add password_hash column to users for credential-based auth
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_hash" text;

-- Optionally, you may want to restrict selecting this column in views or add RLS policies
-- This migration keeps it simple and only adds the column.
