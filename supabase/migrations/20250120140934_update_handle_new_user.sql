CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Log the start of the function execution
  RAISE LOG 'Starting handle_new_user for user ID: %', NEW.id;

  -- Validate input
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Email is required for user creation. User ID: %', NEW.id;
  END IF;

  -- Log the email being processed
  RAISE LOG 'Processing email: %', NEW.email;

  -- Generate a default username
  DECLARE default_username TEXT := 'user-' || substr(NEW.id::text, 1, 8);

  -- Create a profile for the new user
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      username,
      name,
      department,
      institution,
      title,
      scholar_id,
      affiliations,
      research_interests,
      theme,
      layout
    )
    VALUES (
      NEW.id,
      NEW.email,
      default_username,
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), ''),
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'department'), ''), ''),
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'institution'), ''), ''),
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'title'), ''), ''),
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'scholar_id'), ''), ''),
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'affiliations'), ''), ''),
      COALESCE(
        ARRAY(
          SELECT value
          FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'research_interests')
        ),
        '{}'
      ),
      'dark-teal',
      'default'
    );
    RAISE LOG 'Profile created successfully for user ID: %', NEW.id;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Profile creation failed: Duplicate entry for user ID: %', NEW.id;
    WHEN OTHERS THEN
      RAISE LOG 'Error creating profile for user ID: % - Error: %', NEW.id, SQLERRM;
      RAISE;
  END;

  -- Return the new user record
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Unhandled error in handle_new_user for user ID: % - Error: %', NEW.id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql;
