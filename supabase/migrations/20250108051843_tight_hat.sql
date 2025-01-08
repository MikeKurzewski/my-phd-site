/*
  # Add domain configuration
  
  Adds configuration for the test domain phdtest.mgkvisuals.com
*/

-- Add domain configuration
INSERT INTO domain_configs (
  domain,
  user_id,
  settings
) VALUES (
  'phdtest.mgkvisuals.com',
  (SELECT id FROM profiles WHERE username = 'admin' LIMIT 1),
  jsonb_build_object(
    'theme', 'light',
    'layout', 'default'
  )
)
ON CONFLICT (domain) DO NOTHING;