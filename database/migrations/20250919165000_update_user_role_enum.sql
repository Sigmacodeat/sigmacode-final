-- Extend user_role enum with new values 'editor' and 'service'
DO $$
BEGIN
  -- Add 'editor'
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'editor'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'editor';
  END IF;

  -- Add 'service'
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'service'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'service';
  END IF;
END$$;
