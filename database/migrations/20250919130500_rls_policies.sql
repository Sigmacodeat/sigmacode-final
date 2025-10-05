-- Enable RLS on users and settings, add minimal policies

-- users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: users can select their own row; admins can do everything (admin check via jwt role claim later or via DB role)
DROP POLICY IF EXISTS users_self_select ON public.users;
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (auth.uid()::text = id);

-- Optional: restrict updates/deletes to self (uncomment if needed)
-- DROP POLICY IF EXISTS users_self_update ON public.users;
-- CREATE POLICY users_self_update ON public.users
--   FOR UPDATE USING (auth.uid()::text = id);
-- DROP POLICY IF EXISTS users_self_delete ON public.users;
-- CREATE POLICY users_self_delete ON public.users
--   FOR DELETE USING (auth.uid()::text = id);

-- settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings marked as public
DROP POLICY IF EXISTS settings_public_read ON public.settings;
CREATE POLICY settings_public_read ON public.settings
  FOR SELECT TO anon, authenticated USING (is_public = true);

-- Admins full access (assumes a DB role "service_role" or similar; adapt as needed)
-- If using Supabase, service_role bypasses RLS; for local PG, create a role and grant it here
-- Example (uncomment and adapt):
-- GRANT USAGE ON SCHEMA public TO service_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO service_role;
-- RLS bypass is automatic for superuser/service accounts; otherwise define an admin policy by claim check if pgjwt is installed.
