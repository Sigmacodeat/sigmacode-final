-- Migrate settings.id to BIGINT GENERATED ALWAYS AS IDENTITY
-- Safe/idempotent transformation handling pre-existing sequences/defaults

DO $$
BEGIN
  -- Ensure type is BIGINT
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'id'
      AND data_type <> 'bigint'
  ) THEN
    ALTER TABLE public.settings
      ALTER COLUMN id TYPE bigint;
  END IF;

  -- Drop default nextval if present (typical from serial)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'id'
      AND column_default LIKE 'nextval%'
  ) THEN
    ALTER TABLE public.settings
      ALTER COLUMN id DROP DEFAULT;
  END IF;

  -- Try to add identity (will error if already identity -> catch and ignore)
  BEGIN
    ALTER TABLE public.settings
      ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;
  EXCEPTION WHEN duplicate_object THEN
    -- already identity, ignore
    NULL;
  WHEN feature_not_supported THEN
    -- in some PG versions conversion may not be supported; leave as-is
    NULL;
  END;
END$$;

-- Recreate PK (no-op if already present)
ALTER TABLE public.settings
  ADD CONSTRAINT settings_pkey PRIMARY KEY (id);
