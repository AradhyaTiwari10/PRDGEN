-- =====================================================
-- FIX USER LOOKUP FUNCTION - CORRECT DATA TYPES
-- =====================================================
-- Run this script to fix the get_user_by_email function

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_user_by_email(TEXT);

-- Create the corrected function with proper return types
-- The auth.users.email is actually varchar(255), not text
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE(id UUID, email VARCHAR(255))
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT au.id, au.email
    FROM auth.users au
    WHERE au.email = user_email;
END;
$$;

-- Alternative approach: Create a simpler function that just returns the user ID
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT au.id INTO user_id
    FROM auth.users au
    WHERE au.email = user_email
    LIMIT 1;
    
    RETURN user_id;
END;
$$;

-- Function to get email by user ID (reverse lookup)
CREATE OR REPLACE FUNCTION get_user_by_email_reverse(user_id UUID)
RETURNS VARCHAR(255)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email VARCHAR(255);
BEGIN
    SELECT au.email INTO user_email
    FROM auth.users au
    WHERE au.id = user_id
    LIMIT 1;

    RETURN user_email;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email_reverse(UUID) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'User lookup functions fixed successfully!';
    RAISE NOTICE 'get_user_by_email now returns correct types';
    RAISE NOTICE 'get_user_id_by_email added as alternative';
END $$;
