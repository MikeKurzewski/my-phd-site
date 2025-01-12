/*
  # Enable public access to profiles
  
  1. Changes
    - Add public access policies for profiles, projects, and publications tables
    - Maintain secure editing policies for authenticated users
  
  2. Security
    - Anyone can view profiles and their related data
    - Only authenticated users can edit their own data
*/

-- Update profiles policies
DROP POLICY IF EXISTS "Enable select for authenticated users" ON profiles;
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

-- Update projects policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  TO public
  USING (true);

-- Update publications policies
DROP POLICY IF EXISTS "Users can view their own publications" ON publications;
CREATE POLICY "Anyone can view publications"
  ON publications FOR SELECT
  TO public
  USING (true);

-- Update qualifications policies
DROP POLICY IF EXISTS "Users can view their own qualifications" ON qualifications;
CREATE POLICY "Anyone can view qualifications"
  ON qualifications FOR SELECT
  TO public
  USING (true);