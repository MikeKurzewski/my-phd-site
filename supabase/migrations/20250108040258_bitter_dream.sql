/*
  # Fix Profile RLS Policies

  1. Changes
    - Drop existing policies
    - Add comprehensive RLS policies for profiles
    - Set trigger function security
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Set security for trigger function
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;