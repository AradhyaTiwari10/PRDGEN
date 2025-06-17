-- Debug script to check email issues in collaboration system

-- Check collaboration_requests table structure and data
SELECT 
    id,
    requester_email,
    recipient_email,
    requester_id,
    recipient_id,
    status,
    created_at
FROM collaboration_requests
ORDER BY created_at DESC
LIMIT 10;

-- Check if emails are being stored correctly
SELECT 
    cr.id,
    cr.requester_email as stored_requester_email,
    cr.recipient_email as stored_recipient_email,
    au1.email as actual_requester_email,
    au2.email as actual_recipient_email,
    cr.status
FROM collaboration_requests cr
LEFT JOIN auth.users au1 ON cr.requester_id = au1.id
LEFT JOIN auth.users au2 ON cr.recipient_id = au2.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- Check shared_ideas table
SELECT 
    si.id,
    si.owner_id,
    si.collaborator_id,
    au1.email as owner_email,
    au2.email as collaborator_email,
    si.permission_level,
    si.created_at
FROM shared_ideas si
LEFT JOIN auth.users au1 ON si.owner_id = au1.id
LEFT JOIN auth.users au2 ON si.collaborator_id = au2.id
ORDER BY si.created_at DESC
LIMIT 10;

-- Check if there are any email mismatches
SELECT 
    'collaboration_requests' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN requester_email IS NULL OR requester_email = '' THEN 1 END) as empty_requester_emails,
    COUNT(CASE WHEN recipient_email IS NULL OR recipient_email = '' THEN 1 END) as empty_recipient_emails,
    COUNT(CASE WHEN requester_email LIKE '%example.com%' THEN 1 END) as example_com_emails
FROM collaboration_requests

UNION ALL

SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as empty_emails,
    0 as empty_recipient_emails,
    COUNT(CASE WHEN email LIKE '%example.com%' THEN 1 END) as example_com_emails
FROM auth.users;
