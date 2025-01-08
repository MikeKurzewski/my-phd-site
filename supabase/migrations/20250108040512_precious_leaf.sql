/*
  # Add Media Fields to Projects and Publications

  1. Changes
    - Add media_type field to projects for better file handling
    - Add file_urls to publications for storing multiple files
    - Add status field to both tables
*/

-- Modify projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS media_type text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ALTER COLUMN media_urls SET DEFAULT '{}';

-- Modify publications table
ALTER TABLE publications
ADD COLUMN IF NOT EXISTS file_urls jsonb DEFAULT '{"pdf": null, "supplementary": [], "data": []}'::jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';