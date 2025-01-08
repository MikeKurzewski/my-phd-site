/*
  # Update profile schema and constraints

  1. Changes
    - Make email NOT NULL
    - Add social_links column
    - Add default values for text columns
    - Add trigger for profile creation on auth.user creation
*/

-- Add NOT NULL constraint to email
ALTER TABLE profiles 
ALTER COLUMN email SET NOT NULL;

-- Add default values to text columns
ALTER TABLE profiles
ALTER COLUMN name SET DEFAULT '',
ALTER COLUMN title SET DEFAULT '',
ALTER COLUMN institution SET DEFAULT '',
ALTER COLUMN department SET DEFAULT '',
ALTER COLUMN bio SET DEFAULT '';

-- Add social_links if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Create trigger function for auto-creating profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, social_links)
  VALUES (new.id, new.email, '{}'::jsonb);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();