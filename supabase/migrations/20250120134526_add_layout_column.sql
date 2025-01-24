-- Quick little safety check to prevent the column from being added multiple times
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1
                   FROM information_schema.columns
                   WHERE table_name='profiles'
                   AND column_name='layout') THEN
        ALTER TABLE profiles
        ADD COLUMN layout text DEFAULT 'default';
        -- Add the constraint
        ALTER TABLE profiles
        ADD CONSTRAINT check_layout_type
        CHECK (layout IN ('default', 'academic'));
    END IF;
END $$;
