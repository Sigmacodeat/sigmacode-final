-- Drizzle Migration: Initial schema
-- Creates tables: users, sessions, media, settings
-- Adds indexes and constraints according to database/schema/*.ts

-- Users
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token);

-- Media
CREATE TABLE IF NOT EXISTS media (
  id serial PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  width integer,
  height integer,
  alt_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_user_id_idx ON media(user_id);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id serial PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  type text NOT NULL DEFAULT 'string',
  group_name text NOT NULL DEFAULT 'general',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS settings_key_idx ON settings(key);
