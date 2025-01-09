-- Create profile-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for profile-images bucket
CREATE POLICY "Users can upload profile images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their profile images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their profile images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view profile images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'profile-images');