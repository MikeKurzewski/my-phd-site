/*
  # Add profile-files storage bucket

  1. Changes
    - Create profile-files bucket for CV storage
    - Add RLS policies for secure file access
*/

-- Create profile-files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-files', 'profile-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for profile-files bucket
CREATE POLICY "Users can upload profile files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their profile files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their profile files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view profile files"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'profile-files');