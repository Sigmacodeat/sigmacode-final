-- Create verification_tokens table for NextAuth
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_tokens_identifier_token_pk PRIMARY KEY ("identifier", "token")
);

CREATE INDEX IF NOT EXISTS verification_tokens_identifier_idx ON "verification_tokens" ("identifier");
