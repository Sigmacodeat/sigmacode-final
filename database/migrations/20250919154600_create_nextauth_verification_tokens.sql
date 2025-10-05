-- Create table: verification_tokens (NextAuth compatible)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (identifier, token)
);

CREATE INDEX IF NOT EXISTS verification_tokens_identifier_idx ON verification_tokens(identifier);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_verification_tokens_timestamp ON verification_tokens;
CREATE TRIGGER set_verification_tokens_timestamp
BEFORE UPDATE ON verification_tokens
FOR EACH ROW EXECUTE PROCEDURE set_timestamp();
