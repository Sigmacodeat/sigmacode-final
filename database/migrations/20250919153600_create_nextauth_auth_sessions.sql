-- Create auth_sessions table for NextAuth session storage
CREATE TABLE IF NOT EXISTS "auth_sessions" (
  "session_token" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON "auth_sessions" ("user_id");
