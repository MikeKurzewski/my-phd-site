/*
  # Add research interests and qualifications

  1. Changes
    - Add research_interests array column to profiles
    - Create qualifications table with foreign key to profiles
    
  2. Security
    - Enable RLS on qualifications table
    - Add policies for CRUD operations
*/

-- Add research_interests to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS research_interests text[] DEFAULT '{}';

-- Create qualifications table
CREATE TABLE IF NOT EXISTS qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  degree text NOT NULL,
  institution text NOT NULL,
  year int NOT NULL,
  field text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;

-- Create policies for qualifications
CREATE POLICY "Users can view their own qualifications"
  ON qualifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own qualifications"
  ON qualifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own qualifications"
  ON qualifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own qualifications"
  ON qualifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_qualifications_updated_at
  BEFORE UPDATE ON qualifications
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();