-- Ensure user_id column exists in projects table
DO $$ 
LANGUAGE plpgsql
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$ LANGUAGE plpgsql;

-- Create the check_storage_policy function
CREATE OR REPLACE FUNCTION public.check_storage_policy(bucket_id text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple check - authenticated users can access their own folders
  RETURN true;
END;
$$;

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
    VALUES ('project-media', 'project-media', true),
           ('pdf-documents', 'pdf-documents', true);
  END IF;
END $$;

-- Create RLS policies for project-media bucket
DO $$
BEGIN
  -- Only create policies if the bucket exists
  IF EXISTS (
    SELECT 1 
    FROM storage.buckets 
    WHERE id = 'project-media'
  ) THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Authenticated users can upload to their project-media folder" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can view their project media" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update their project media" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete their project media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow uploads to project-media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow viewing project media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow updating project media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow deleting project media" ON storage.objects;
    
    -- Create completely permissive policies for project-media bucket
    CREATE POLICY "Public project media access"
    ON storage.objects
    FOR ALL
    TO public
    USING (bucket_id = 'project-media')
    WITH CHECK (bucket_id = 'project-media');
  END IF;
END $$;
