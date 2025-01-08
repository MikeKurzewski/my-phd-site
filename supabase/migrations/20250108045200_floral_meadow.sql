/*
  # Update publications table structure

  1. Changes
    - Remove old URL columns (pdf_url, doi_url, preprint_url)
    - Add publication_url and media_files columns
    
  2. Security
    - Update RLS policies for the new structure
*/

-- Remove old URL columns
ALTER TABLE publications 
DROP COLUMN IF EXISTS pdf_url,
DROP COLUMN IF EXISTS doi_url,
DROP COLUMN IF EXISTS preprint_url;

-- Add new columns
ALTER TABLE publications
ADD COLUMN IF NOT EXISTS publication_url text,
ADD COLUMN IF NOT EXISTS media_files text[] DEFAULT '{}';

-- Update RLS policies
DROP POLICY IF EXISTS "Users can insert their own publications" ON publications;
DROP POLICY IF EXISTS "Users can update their own publications" ON publications;

CREATE POLICY "Users can insert their own publications"
  ON publications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own publications"
  ON publications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);