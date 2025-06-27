-- Simple user lookup function fix
DROP FUNCTION IF EXISTS get_user_id_by_email(TEXT);

CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    RETURN user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated, anon;
