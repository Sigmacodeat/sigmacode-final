-- Seed basic SaaS plans and entitlements
INSERT INTO plans (id, name, description, price_monthly, price_yearly, is_active)
VALUES
  ('plan_free', 'Free', 'Free tier with limited usage', 0.00, NULL, TRUE),
  ('plan_basic', 'Basic', 'Basic plan for individuals', 29.00, 290.00, TRUE),
  ('plan_pro', 'Pro', 'Pro plan with advanced features', 99.00, 990.00, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO entitlements (id, name, description, is_active)
VALUES
  ('feature_api', 'API Access', 'Access to core API features', TRUE),
  ('feature_priority_support', 'Priority Support', 'Faster support response times', TRUE),
  ('feature_advanced_limits', 'Advanced Limits', 'Higher quotas and limits', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Map plan -> entitlements
INSERT INTO plan_entitlements (plan_id, entitlement_id)
VALUES
  ('plan_free', 'feature_api'),
  ('plan_basic', 'feature_api'),
  ('plan_basic', 'feature_advanced_limits'),
  ('plan_pro', 'feature_api'),
  ('plan_pro', 'feature_advanced_limits'),
  ('plan_pro', 'feature_priority_support')
ON CONFLICT (plan_id, entitlement_id) DO NOTHING;
