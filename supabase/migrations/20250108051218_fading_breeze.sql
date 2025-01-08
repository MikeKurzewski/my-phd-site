-- Add domains table
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  domain text NOT NULL UNIQUE,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own domains"
  ON domains FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own domains"
  ON domains FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains"
  ON domains FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains"
  ON domains FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();