-- Enable extension for UUID generation (for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(128) NOT NULL,
  category varchar(64) NOT NULL,
  description text,
  icon varchar(64),
  requires_auth boolean NOT NULL DEFAULT false,
  auth_type varchar(64),
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed initial tools
INSERT INTO tools (name, category, description, icon, requires_auth, auth_type, is_enabled)
VALUES
  ('Dify Workflows', 'AI', 'Workflow-Orchestrierung und Agent-Fähigkeiten', 'workflow', true, 'api_key', true),
  ('Neural Firewall', 'Security', 'LLM Firewall mit Shadow/Enforce Modus', 'shield', false, NULL, true),
  ('Monitoring (Grafana)', 'Observability', 'Dashboards und Metriken', 'activity', false, NULL, true)
ON CONFLICT DO NOTHING;
