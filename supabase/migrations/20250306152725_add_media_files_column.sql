-- Add media_files column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS media_files TEXT[] DEFAULT '{}';

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

-- Make project media publicly accessible
DROP POLICY IF EXISTS "Public can view project media" ON storage.objects;
CREATE POLICY "Public can view project media" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'project-media');
