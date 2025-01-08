/*
  # Create domain configuration table
  
  1. New Tables
    - `domain_configs`
      - `id` (uuid, primary key)
      - `domain` (text, unique)
      - `user_id` (uuid, references profiles)
      - `settings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create domain_configs table
CREATE TABLE IF NOT EXISTS domain_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE domain_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own domain configs"
  ON domain_configs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own domain configs"
  ON domain_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domain configs"
  ON domain_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_domain_configs_updated_at
  BEFORE UPDATE ON domain_configs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();