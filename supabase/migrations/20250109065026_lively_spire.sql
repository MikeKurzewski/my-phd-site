/*
  # Add publication type column

  1. Changes
    - Add type column to publications table with default value 'publication'
    - Add check constraint to ensure type is either 'publication' or 'preprint'
*/

ALTER TABLE publications
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'publication'
CHECK (type IN ('publication', 'preprint'));

-- Update any existing rows to have the default type
UPDATE publications SET type = 'publication' WHERE type IS NULL;