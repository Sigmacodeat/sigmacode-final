-- Create table: plans (SaaS pricing plans)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY, -- e.g., plan_basic, plan_pro, plan_enterprise
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plans_active_idx ON plans(is_active);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_plans_timestamp ON plans;
CREATE TRIGGER set_plans_timestamp
BEFORE UPDATE ON plans
FOR EACH ROW EXECUTE PROCEDURE set_timestamp();
