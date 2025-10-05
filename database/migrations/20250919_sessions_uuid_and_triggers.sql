-- Migration: Convert sessions.id to UUID and add updated_at triggers
-- Date: 2025-09-19

-- 1) Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Migrate sessions.id from serial/integer to uuid
DO $$
BEGIN
  -- Only run when sessions.id is not already uuid
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_name = 'sessions'
      AND c.column_name = 'id'
      AND c.data_type <> 'uuid'
  ) THEN
    -- Add temporary uuid column with default
    ALTER TABLE sessions ADD COLUMN id_uuid uuid DEFAULT gen_random_uuid();

    -- Drop old PK if exists
    ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_pkey;

    -- Ensure all rows have a uuid (default already covers new rows)
    UPDATE sessions SET id_uuid = COALESCE(id_uuid, gen_random_uuid());

    -- Drop old column and rename new one
    ALTER TABLE sessions DROP COLUMN id;
    ALTER TABLE sessions RENAME COLUMN id_uuid TO id;

    -- Recreate PK on new uuid id
    ALTER TABLE sessions ADD PRIMARY KEY (id);
  END IF;
END
$$;

-- 3) Create or replace a trigger function to keep updated_at in sync
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Helper to create trigger if table and column exist
DO $$
DECLARE
  tbl text;
BEGIN
  -- users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_users') THEN
      CREATE TRIGGER set_updated_at_users
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
  END IF;

  -- sessions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'updated_at') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_sessions') THEN
      CREATE TRIGGER set_updated_at_sessions
      BEFORE UPDATE ON sessions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
  END IF;

  -- settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'updated_at') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_settings') THEN
      CREATE TRIGGER set_updated_at_settings
      BEFORE UPDATE ON settings
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
  END IF;

  -- media (if present)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'updated_at') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_media') THEN
      CREATE TRIGGER set_updated_at_media
      BEFORE UPDATE ON media
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
  END IF;
END
$$;
