-- Create table: entitlements (feature flags / capabilities)
CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY, -- e.g., feature_api, feature_priority_support
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entitlements_active_idx ON entitlements(is_active);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_entitlements_timestamp ON entitlements;
CREATE TRIGGER set_entitlements_timestamp
BEFORE UPDATE ON entitlements
FOR EACH ROW EXECUTE PROCEDURE set_timestamp();
