-- Add username column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create function to generate username from name
CREATE OR REPLACE FUNCTION generate_username(name text)
RETURNS text AS $$
DECLARE
  base_username text;
  test_username text;
  counter integer := 0;
BEGIN
  -- Convert name to lowercase and replace spaces with hyphens
  base_username := lower(regexp_replace(name, '\s+', '-', 'g'));
  -- Remove special characters
  base_username := regexp_replace(base_username, '[^a-z0-9\-]', '', 'g');
  
  -- Start with base username
  test_username := base_username;
  
  -- Keep trying until we find an unused username
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = test_username) LOOP
    counter := counter + 1;
    test_username := base_username || '-' || counter;
  END LOOP;
  
  RETURN test_username;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles with usernames based on their names
DO $$
BEGIN
  UPDATE profiles
  SET username = generate_username(COALESCE(name, 'user'))
  WHERE username IS NULL;
END $$;

-- Make username required for new profiles
ALTER TABLE profiles
ALTER COLUMN username SET NOT NULL;

-- Update the handle_new_user function to generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, social_links)
  VALUES (
    new.id,
    new.email,
    generate_username(COALESCE(new.raw_user_meta_data->>'name', 'user')),
    '{}'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;