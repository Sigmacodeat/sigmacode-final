-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  firewall_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  firewall_policy TEXT NOT NULL DEFAULT 'off',
  firewall_config JSONB,
  model_tier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agents_owner_user_id_idx ON agents(owner_user_id);
CREATE INDEX IF NOT EXISTS agents_name_idx ON agents(name);

-- Create user_entitlements table (per-user overrides)
CREATE TABLE IF NOT EXISTS user_entitlements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entitlement_id TEXT NOT NULL REFERENCES entitlements(id) ON DELETE CASCADE,
  value TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_entitlements_pk PRIMARY KEY (user_id, entitlement_id)
);

CREATE INDEX IF NOT EXISTS user_entitlements_user_id_idx ON user_entitlements(user_id);
CREATE INDEX IF NOT EXISTS user_entitlements_entitlement_id_idx ON user_entitlements(entitlement_id);

-- Create append-only audit_log with hash chain columns
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  payload JSONB,
  previous_hash TEXT,
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_actor_idx ON audit_log(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS audit_log_action_idx ON audit_log(action);
CREATE INDEX IF NOT EXISTS audit_log_resource_idx ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at);

-- Optional: add trigger stubs to protect audit_log from updates/deletes (implement function if needed)
-- CREATE OR REPLACE FUNCTION audit_log_block_write()
-- RETURNS trigger AS $$
-- BEGIN
--   IF TG_OP IN ('UPDATE', 'DELETE') THEN
--     RAISE EXCEPTION 'audit_log is append-only';
--   END IF;
--   RETURN NEW;
-- END; $$ LANGUAGE plpgsql;
--
-- DO $$ BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_log_block_update') THEN
--     CREATE TRIGGER audit_log_block_update BEFORE UPDATE ON audit_log
--     FOR EACH ROW EXECUTE FUNCTION audit_log_block_write();
--   END IF;
--   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_log_block_delete') THEN
--     CREATE TRIGGER audit_log_block_delete BEFORE DELETE ON audit_log
--     FOR EACH ROW EXECUTE FUNCTION audit_log_block_write();
--   END IF;
-- END $$;
