-- Fix user lookup functions for collaboration system

-- Create the get_user_id_by_email function (returns UUID, not table)
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = user_email;
    
    RETURN user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;

-- Also create the reverse function if it doesn't exist
CREATE OR REPLACE FUNCTION get_user_by_email_reverse(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;
    
    RETURN user_email;
END;
$$;

-- Grant execute permission to authenticated users  
GRANT EXECUTE ON FUNCTION get_user_by_email_reverse(UUID) TO authenticated;

-- Test the function works by selecting from it (will be commented out in production)
-- SELECT get_user_id_by_email('test@example.com'); 

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'User lookup functions created successfully!';
    RAISE NOTICE 'Functions available: get_user_id_by_email(TEXT), get_user_by_email_reverse(UUID)';
END $$; 