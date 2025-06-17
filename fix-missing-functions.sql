-- Fix missing database functions for collaboration system

-- Create the missing get_user_by_email_reverse function
CREATE OR REPLACE FUNCTION get_user_by_email_reverse(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the email for the given user_id
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;
    
    RETURN user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_email_reverse(UUID) TO authenticated;

-- Also ensure get_user_by_email exists (for getting user_id from email)
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user_id for the given email
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = user_email;
    
    RETURN user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;

-- Create function to get user details (id and email) - useful for collaboration
CREATE OR REPLACE FUNCTION get_user_details_by_email(user_email TEXT)
RETURNS TABLE(user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT id, auth.users.email
    FROM auth.users
    WHERE auth.users.email = user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_details_by_email(TEXT) TO authenticated;

-- Create function to get user details by ID
CREATE OR REPLACE FUNCTION get_user_details_by_id(user_id UUID)
RETURNS TABLE(user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT id, auth.users.email
    FROM auth.users
    WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_details_by_id(UUID) TO authenticated;
