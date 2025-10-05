-- Create table: subscriptions (user <-> plan)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY, -- e.g., sub_xxx or UUID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL, -- active, trialing, past_due, canceled, unpaid
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  external_customer_id TEXT,
  external_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_id_idx ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_subscriptions_timestamp ON subscriptions;
CREATE TRIGGER set_subscriptions_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE PROCEDURE set_timestamp();
