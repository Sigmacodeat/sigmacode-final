BEGIN;

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create user_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
END
$$;

-- Migrate users.role to user_role enum and enforce defaults
ALTER TABLE IF EXISTS users
  ALTER COLUMN role TYPE user_role USING role::user_role;

ALTER TABLE IF EXISTS users
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN role SET NOT NULL;

-- Ensure sessions.id has a UUID default
ALTER TABLE IF EXISTS sessions
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enable Row Level Security on core tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;

-- Basic example policies (adjust to your auth model as needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'users_select_all' AND tablename = 'users'
  ) THEN
    CREATE POLICY users_select_all ON users FOR SELECT USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'sessions_select_all' AND tablename = 'sessions'
  ) THEN
    CREATE POLICY sessions_select_all ON sessions FOR SELECT USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'settings_select_public' AND tablename = 'settings'
  ) THEN
    CREATE POLICY settings_select_public ON settings FOR SELECT USING (is_public = true);
  END IF;
END
$$;

COMMIT;
