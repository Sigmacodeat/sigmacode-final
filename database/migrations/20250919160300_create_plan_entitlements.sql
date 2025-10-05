-- Create table: plan_entitlements (plan <-> entitlement)
CREATE TABLE IF NOT EXISTS plan_entitlements (
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  entitlement_id TEXT NOT NULL REFERENCES entitlements(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT plan_entitlements_pk PRIMARY KEY (plan_id, entitlement_id)
);

CREATE INDEX IF NOT EXISTS plan_entitlements_plan_id_idx ON plan_entitlements(plan_id);
CREATE INDEX IF NOT EXISTS plan_entitlements_entitlement_id_idx ON plan_entitlements(entitlement_id);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_plan_entitlements_timestamp ON plan_entitlements;
CREATE TRIGGER set_plan_entitlements_timestamp
BEFORE UPDATE ON plan_entitlements
FOR EACH ROW EXECUTE PROCEDURE set_timestamp();
