-- Erstelle die fehlenden Tabellen, falls sie nicht existieren

-- Sitzungen für Benutzer
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Medieninhalte (Bilder, Videos, etc.)
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Anwendungseinstellungen
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'string',
  group_name VARCHAR(50) NOT NULL DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Standardwerte für Einstellungen
INSERT INTO settings (key, value, type, group_name, is_public)
VALUES 
  ('site_name', 'SigmaCode', 'string', 'general', true),
  ('site_description', 'Eine moderne Webanwendung', 'string', 'general', true),
  ('items_per_page', '10', 'number', 'pagination', true)
ON CONFLICT (key) DO NOTHING;
