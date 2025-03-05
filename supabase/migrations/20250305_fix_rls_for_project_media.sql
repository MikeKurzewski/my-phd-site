-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Authenticated users can manage their own projects"
ON projects
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for project media
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', true);

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

CREATE POLICY "Authenticated users can delete their project media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'project-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
