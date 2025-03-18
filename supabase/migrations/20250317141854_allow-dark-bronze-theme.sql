-- Add dark-bronze theme to the list of allowed themes
-- This is a one-time migration script

DO $$
BEGIN
  -- drop the existing constraint
    ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS profiles_theme_check;

  -- Add our new constraints check, including the dark-bronze theme
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_theme_check
    CHECK (
        theme IN ('dark-teal', 'light-teal', 'dark-bronze', 'dark-blue', 'light-blue', 'minimal')
    );
END $$;
