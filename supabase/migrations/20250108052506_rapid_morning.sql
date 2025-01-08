/*
  # Update domain configuration
  
  1. Changes
    - Add default domain for admin user
    - Update existing domains to use new domain
*/

-- Create a function to safely update domains
CREATE OR REPLACE FUNCTION update_domains()
RETURNS void AS $$
BEGIN
  -- Update existing domains to use new domain
  UPDATE domains 
  SET domain = regexp_replace(domain, '\.phd-website\.com$', '.phdtest.mgkvisuals.com')
  WHERE domain LIKE '%.phd-website.com';

  -- Only insert default domain if we have an admin user
  INSERT INTO domains (domain, user_id, verified)
  SELECT 
    'phdtest.mgkvisuals.com',
    id,
    true
  FROM profiles 
  WHERE username = 'admin'
  ON CONFLICT (domain) DO UPDATE
  SET verified = true;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT update_domains();