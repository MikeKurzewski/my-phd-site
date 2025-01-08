/*
  # Update domain references
  
  1. Changes
    - Update existing domains to use phdtest.mgkvisuals.com
    - Ensure base domain exists and is verified
*/

-- Update any existing references to phd-website.com
UPDATE domains 
SET domain = regexp_replace(domain, '\.phd-website\.com$', '.phdtest.mgkvisuals.com')
WHERE domain LIKE '%.phd-website.com';

-- Ensure the base domain exists
INSERT INTO domains (domain, verified)
VALUES ('phdtest.mgkvisuals.com', true)
ON CONFLICT (domain) DO UPDATE
SET verified = true;