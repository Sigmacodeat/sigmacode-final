-- Migration: Create user_role enum and enable RLS on users with permissive policies
-- Date: 2025-09-19

-- 1) Create enum type user_role if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
END
$$;

-- 2) Alter users.role to enum type and set default
ALTER TABLE users
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'user'::user_role,
  ALTER COLUMN role SET NOT NULL;

-- 3) Enable Row Level Security and add permissive policies (placeholder)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'users' AND policyname = 'users_select_all') THEN
    CREATE POLICY users_select_all ON users FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'users' AND policyname = 'users_insert_all') THEN
    CREATE POLICY users_insert_all ON users FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'users' AND policyname = 'users_update_all') THEN
    CREATE POLICY users_update_all ON users FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'users' AND policyname = 'users_delete_all') THEN
    CREATE POLICY users_delete_all ON users FOR DELETE USING (true);
  END IF;
END
$$;
