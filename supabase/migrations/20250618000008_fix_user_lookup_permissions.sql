-- Fix user lookup function permissions and ensure it works

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_id_by_email(TEXT);
DROP FUNCTION IF EXISTS get_user_by_email_reverse(UUID);

-- Create the get_user_id_by_email function with proper permissions
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Query the auth.users table for the given email
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = user_email;
    
    -- Return the user_id (will be NULL if not found)
    RETURN user_id;
END;
$$;

-- Create the reverse function  
CREATE OR REPLACE FUNCTION get_user_by_email_reverse(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Query the auth.users table for the given user_id
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;
    
    -- Return the email (will be NULL if not found)
    RETURN user_email;
END;
$$;

-- Grant execute permissions to all authenticated users
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email_reverse(UUID) TO authenticated;

-- Also grant to anon role for testing
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_email_reverse(UUID) TO anon;

-- Test the function by selecting it (this will validate it works)
DO $$
DECLARE
    test_result UUID;
BEGIN
    -- Test with a non-existent email (should return NULL without error)
    SELECT get_user_id_by_email('nonexistent@test.com') INTO test_result;
    RAISE NOTICE 'Function test completed successfully. Test result: %', COALESCE(test_result::TEXT, 'NULL');
    RAISE NOTICE 'User lookup functions recreated with proper permissions';
    RAISE NOTICE 'Functions available: get_user_id_by_email(TEXT), get_user_by_email_reverse(UUID)';
    RAISE NOTICE 'Permissions granted to: authenticated, anon';
END $$;
