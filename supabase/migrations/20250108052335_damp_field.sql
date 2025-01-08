-- Update any existing references to phd-website.com
UPDATE domains 
SET domain = regexp_replace(domain, '\.phd-website\.com$', '.phdtest.mgkvisuals.com')
WHERE domain LIKE '%.phd-website.com';

-- Update domain_configs table
UPDATE domain_configs 
SET domain = regexp_replace(domain, '\.phd-website\.com$', '.phdtest.mgkvisuals.com')
WHERE domain LIKE '%.phd-website.com';

-- Ensure the base domain exists
INSERT INTO domains (domain, verified)
VALUES ('phdtest.mgkvisuals.com', true)
ON CONFLICT (domain) DO UPDATE
SET verified = true;