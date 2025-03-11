-- Add media_files column to projects table if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS media_files TEXT[] DEFAULT '{}';

-- Create project-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for project-media bucket
DROP POLICY IF EXISTS "Users can upload their own project media" ON storage.objects;
CREATE POLICY "Users can upload their own project media" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'project-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can access their own project media" ON storage.objects;
CREATE POLICY "Users can access their own project media" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'project-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Make project media publicly accessible for viewing
DROP POLICY IF EXISTS "Public can view project media" ON storage.objects;
CREATE POLICY "Public can view project media" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'project-media');

-- Allow users to update and delete their own media
DROP POLICY IF EXISTS "Users can update their own project media" ON storage.objects;
CREATE POLICY "Users can update their own project media" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'project-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own project media" ON storage.objects;
CREATE POLICY "Users can delete their own project media" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'project-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
