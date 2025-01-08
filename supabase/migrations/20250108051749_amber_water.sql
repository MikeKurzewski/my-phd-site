/*
  # Add test domain

  Adds the test domain phdtest.mgkvisuals.com to the domains table
*/

-- Insert the domain record
INSERT INTO domains (domain, verified)
VALUES ('phdtest.mgkvisuals.com', false)
ON CONFLICT (domain) DO NOTHING;