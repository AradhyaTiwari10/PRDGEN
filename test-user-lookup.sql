-- Test script to verify user lookup functions

-- Check if functions exist
SELECT 
    proname, 
    proargtypes::regtype[],
    prosrc
FROM pg_proc 
WHERE proname LIKE '%user%email%'
ORDER BY proname;

-- Test get_user_id_by_email function
SELECT 'Testing get_user_id_by_email function:' as test;
SELECT get_user_id_by_email('aradhya.tiwari2024@nst.rishihood.edu.in') as user_id;

-- Check if any users exist in auth.users
SELECT 'Users in auth.users:' as test;
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Test the function with a known existing user
SELECT 'Testing with first existing user:' as test;
SELECT get_user_id_by_email(email) as found_user_id, email
FROM auth.users 
LIMIT 1; 