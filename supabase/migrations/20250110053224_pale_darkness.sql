/*
  # Convert publication columns to text

  1. Changes
    - Convert arrays to text fields
    - Simplify storage format
    - Maintain data integrity during conversion

  2. Notes
    - Preserves existing data by converting to text format
    - Uses proper PostgreSQL syntax for column operations
*/

-- Temporarily disable RLS
ALTER TABLE publications DISABLE ROW LEVEL SECURITY;

-- Add new text columns
ALTER TABLE publications
ADD COLUMN authors_text text DEFAULT '';

ALTER TABLE publications
ADD COLUMN media_files_text text DEFAULT '';

-- Update new text columns with converted data
UPDATE publications 
SET 
  authors_text = array_to_string(authors, ', '),
  media_files_text = array_to_string(media_files, ', ');

-- Drop array columns
ALTER TABLE publications
DROP COLUMN authors;

ALTER TABLE publications
DROP COLUMN media_files;

-- Rename text columns to original names (one at a time)
ALTER TABLE publications
RENAME COLUMN authors_text TO authors;

ALTER TABLE publications
RENAME COLUMN media_files_text TO media_files;

-- Re-enable RLS
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;