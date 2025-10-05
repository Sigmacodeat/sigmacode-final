-- Create table: auth_sessions (NextAuth compatible)
-- Separate from existing business sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
  session_token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions(user_id);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_auth_sessions_timestamp ON auth_sessions;
CREATE TRIGGER set_auth_sessions_timestamp
BEFORE UPDATE ON auth_sessions
FOR EACH ROW EXECUTE PROCEDURE set_timestamp();
