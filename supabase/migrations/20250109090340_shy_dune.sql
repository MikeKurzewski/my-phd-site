-- Drop and recreate the handle_new_user function with better null handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_username text;
BEGIN
  -- Generate a default username using the email prefix if name is not available
  default_username := split_part(new.email, '@', 1);
  
  INSERT INTO public.profiles (
    id,
    email,
    username,
    name,
    social_links,
    research_interests
  )
  VALUES (
    new.id,
    new.email,
    generate_username(COALESCE(
      new.raw_user_meta_data->>'name',
      default_username,
      'user-' || substr(new.id::text, 1, 8)
    )),
    COALESCE(new.raw_user_meta_data->>'name', ''),
    '{}'::jsonb,
    '{}'::text[]
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Make sure the function has the correct permissions
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it's using the latest version
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();