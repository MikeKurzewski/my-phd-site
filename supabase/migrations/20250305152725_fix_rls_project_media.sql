-- Enable RLS on projects table if not already enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Authenticated users can manage their own projects"
ON projects
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for project media if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM storage.buckets 
    WHERE id = 'project-media'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('project-media', 'project-media', true);
  END IF;
END $$;

-- Create RLS policies for project-media bucket
CREATE POLICY "Authenticated users can upload to their project-media folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'project-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can view their project media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'project-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can update their project media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'project-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can delete their project media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'project-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
