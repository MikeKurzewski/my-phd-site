/*
  # Add Storage Buckets for Files

  1. Changes
    - Create project-media bucket for project files
    - Create publication-files bucket for publication files
    - Add RLS policies for both buckets
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('project-media', 'project-media', true),
  ('publication-files', 'publication-files', true);

-- Set up RLS policies for project-media bucket
CREATE POLICY "Users can upload project media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-media' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their project media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'project-media' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their project media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-media' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view project media"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'project-media');

-- Set up RLS policies for publication-files bucket
CREATE POLICY "Users can upload publication files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'publication-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their publication files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'publication-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their publication files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'publication-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view publication files"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'publication-files');