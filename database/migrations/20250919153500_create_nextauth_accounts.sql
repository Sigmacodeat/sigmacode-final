-- Create accounts table for NextAuth OAuth providers
CREATE TABLE IF NOT EXISTS "accounts" (
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounts_provider_provider_account_id_pk PRIMARY KEY ("provider", "provider_account_id")
);

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON "accounts" ("user_id");
CREATE INDEX IF NOT EXISTS accounts_provider_idx ON "accounts" ("provider");
