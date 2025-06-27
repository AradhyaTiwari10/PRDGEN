-- Create test user for collaboration testing
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'authenticated',
    'authenticated',
    'aradhyafcb@gmail.com',
    '$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only',
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW());

-- Test the function works
SELECT 'Test user created. Function test result:' as status, get_user_id_by_email('aradhyafcb@gmail.com') as user_id; 