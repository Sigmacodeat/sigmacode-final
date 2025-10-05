-- Migration: Fix sessions table for NextAuth compatibility
-- Date: 2025-09-22

-- Drop existing sessions table if it exists
DROP TABLE IF EXISTS sessions CASCADE;

-- Create new sessions table compatible with NextAuth
CREATE TABLE sessions (
    session_token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

-- Add indexes for better performance
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_idx ON sessions(expires);
