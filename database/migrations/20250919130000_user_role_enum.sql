-- Create user_role enum type if not exists
DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Ensure column uses enum type and default
ALTER TABLE public.users
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'user'::user_role,
  ALTER COLUMN role SET NOT NULL;

-- Recreate indexes if needed (no-op if already present)
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
