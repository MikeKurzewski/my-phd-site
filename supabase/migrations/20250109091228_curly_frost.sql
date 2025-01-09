-- Add default free plan subscriptions for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users who don't have an active subscription
    FOR user_record IN 
        SELECT DISTINCT auth.users.id 
        FROM auth.users 
        LEFT JOIN subscriptions ON auth.users.id = subscriptions.user_id 
        WHERE subscriptions.id IS NULL
    LOOP
        -- Insert a free plan subscription
        INSERT INTO subscriptions (
            id,
            user_id,
            status,
            plan,
            current_period_end,
            cancel_at_period_end,
            created_at,
            updated_at
        ) VALUES (
            'free_' || user_record.id,  -- Create a unique ID for free subscriptions
            user_record.id,
            'active',
            'free',
            'infinity',  -- Free plan doesn't expire
            false,
            now(),
            now()
        );
    END LOOP;
END $$;

-- Add a trigger to automatically create free subscriptions for new users
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
    INSERT INTO subscriptions (
        id,
        user_id,
        status,
        plan,
        current_period_end,
        cancel_at_period_end
    ) VALUES (
        'free_' || NEW.id,
        NEW.id,
        'active',
        'free',
        'infinity',
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_subscription();