-- Supabase Schema Extension für SigmaCode AI SaaS

-- AI Agents Table
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_type VARCHAR(50) NOT NULL DEFAULT 'dify',
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Agent Executions/Invocations
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  request_id VARCHAR(255) UNIQUE,
  trigger_type VARCHAR(50) DEFAULT 'manual',
  status VARCHAR(50) DEFAULT 'pending',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  latency_ms INTEGER,
  firewall_status VARCHAR(50),
  firewall_mode VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Trigger Templates (für wiederholende Tasks)
CREATE TABLE IF NOT EXISTS trigger_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Scheduled Triggers (Cron Jobs)
CREATE TABLE IF NOT EXISTS scheduled_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES trigger_templates(id),
  cron_expression VARCHAR(255) NOT NULL,
  next_run TIMESTAMP WITH TIME ZONE,
  last_run TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Webhook Logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id VARCHAR(255),
  webhook_source VARCHAR(255),
  payload JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'received',
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics & Metrics
CREATE TABLE IF NOT EXISTS agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

-- User Preferences & Settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys (für externe Services)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  service VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_user_id ON agent_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created_at ON agent_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_trigger_id ON webhook_logs(trigger_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_triggers_next_run ON scheduled_triggers(next_run);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_date ON agent_metrics(date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies für ai_agents
CREATE POLICY "Users can view their own agents" ON ai_agents
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create agents" ON ai_agents
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own agents" ON ai_agents
  FOR UPDATE USING (auth.uid() = created_by);

-- Policies für agent_executions
CREATE POLICY "Users can view their own executions" ON agent_executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create executions" ON agent_executions
  FOR INSERT WITH CHECK (true);

-- Policies für user_preferences
CREATE POLICY "Users can manage their preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Functions für automatische Updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trigger_templates_updated_at BEFORE UPDATE ON trigger_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_triggers_updated_at BEFORE UPDATE ON scheduled_triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function für Agent Metrics Aggregation
CREATE OR REPLACE FUNCTION update_agent_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update metrics for the current date
    INSERT INTO agent_metrics (agent_id, date, total_executions, successful_executions, failed_executions, avg_latency_ms)
    VALUES (
        NEW.agent_id,
        CURRENT_DATE,
        1,
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
        NEW.latency_ms
    )
    ON CONFLICT (agent_id, date) DO UPDATE SET
        total_executions = agent_metrics.total_executions + 1,
        successful_executions = agent_metrics.successful_executions + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        failed_executions = agent_metrics.failed_executions + CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
        avg_latency_ms = CASE
            WHEN agent_metrics.total_executions > 0
            THEN ROUND((agent_metrics.avg_latency_ms * agent_metrics.total_executions + COALESCE(NEW.latency_ms, 0)) / (agent_metrics.total_executions + 1))
            ELSE COALESCE(NEW.latency_ms, 0)
        END;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_agent_metrics
    AFTER INSERT ON agent_executions
    FOR EACH ROW EXECUTE FUNCTION update_agent_metrics();

-- Sample Data für Development
INSERT INTO ai_agents (name, description, agent_type, config) VALUES
('Demo Agent', 'Beispiel AI Agent für Tests', 'dify', '{"endpoint": "https://api.dify.ai/v1/chat-messages", "model": "gpt-4"}')
ON CONFLICT DO NOTHING;

-- Views für Analytics
CREATE VIEW agent_performance AS
SELECT
    a.name as agent_name,
    m.date,
    m.total_executions,
    m.successful_executions,
    m.failed_executions,
    ROUND(m.successful_executions::decimal / NULLIF(m.total_executions, 0) * 100, 2) as success_rate,
    m.avg_latency_ms,
    m.total_tokens
FROM agent_metrics m
JOIN ai_agents a ON a.id = m.agent_id
ORDER BY m.date DESC, m.total_executions DESC;

CREATE VIEW daily_stats AS
SELECT
    date,
    SUM(total_executions) as total_executions,
    SUM(successful_executions) as successful_executions,
    SUM(failed_executions) as failed_executions,
    ROUND(AVG(avg_latency_ms), 0) as avg_latency_ms,
    SUM(total_tokens) as total_tokens
FROM agent_metrics
GROUP BY date
ORDER BY date DESC;
