-- Comprehensive fix for collaboration system issues

-- 1. Create missing database functions
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_by_email_reverse(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;

-- 2. Fix RLS policies for ideas table
DROP POLICY IF EXISTS "Users can view ideas they have collaboration requests for" ON ideas;

CREATE POLICY "Users can view ideas they have collaboration requests for" ON ideas
FOR SELECT
USING (
    auth.uid() = user_id OR  -- Owner can always see
    id IN (
        SELECT idea_id 
        FROM shared_ideas 
        WHERE collaborator_id = auth.uid()
    ) OR  -- Collaborators can see
    id IN (
        SELECT idea_id 
        FROM collaboration_requests 
        WHERE recipient_id = auth.uid() AND status = 'pending'
    )  -- Recipients of pending requests can see
);

-- 3. Create function to get idea title for collaboration (bypasses RLS)
CREATE OR REPLACE FUNCTION get_idea_title_for_collaboration(request_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    idea_title TEXT;
    request_idea_id UUID;
BEGIN
    SELECT idea_id INTO request_idea_id
    FROM collaboration_requests
    WHERE id = request_id;
    
    IF request_idea_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    SELECT title INTO idea_title
    FROM ideas
    WHERE id = request_idea_id;
    
    RETURN COALESCE(idea_title, 'Untitled Idea');
END;
$$;

GRANT EXECUTE ON FUNCTION get_idea_title_for_collaboration(UUID) TO authenticated;

-- 4. Fix any existing data issues
-- Update any collaboration requests with missing or incorrect emails
UPDATE collaboration_requests 
SET 
    requester_email = (
        SELECT email FROM auth.users WHERE id = collaboration_requests.requester_id
    )
WHERE requester_email IS NULL 
   OR requester_email = '' 
   OR requester_email = 'Unknown'
   OR requester_email LIKE '%example.com%';

UPDATE collaboration_requests 
SET 
    recipient_email = (
        SELECT email FROM auth.users WHERE id = collaboration_requests.recipient_id
    )
WHERE recipient_email IS NULL 
   OR recipient_email = '' 
   OR recipient_email LIKE '%example.com%';

-- 5. Clean up any orphaned data
-- Remove collaboration requests where users no longer exist
DELETE FROM collaboration_requests 
WHERE requester_id NOT IN (SELECT id FROM auth.users)
   OR recipient_id NOT IN (SELECT id FROM auth.users);

-- Remove shared_ideas where users no longer exist
DELETE FROM shared_ideas 
WHERE owner_id NOT IN (SELECT id FROM auth.users)
   OR collaborator_id NOT IN (SELECT id FROM auth.users);

-- 6. Verification queries
SELECT 'Collaboration Requests Check' as check_type, COUNT(*) as total_count FROM collaboration_requests;
SELECT 'Shared Ideas Check' as check_type, COUNT(*) as total_count FROM shared_ideas;

-- Check for any remaining email issues
SELECT 
    'Email Issues' as check_type,
    COUNT(CASE WHEN requester_email LIKE '%example.com%' THEN 1 END) as example_com_requester,
    COUNT(CASE WHEN recipient_email LIKE '%example.com%' THEN 1 END) as example_com_recipient,
    COUNT(CASE WHEN requester_email IS NULL OR requester_email = '' THEN 1 END) as empty_requester,
    COUNT(CASE WHEN recipient_email IS NULL OR recipient_email = '' THEN 1 END) as empty_recipient
FROM collaboration_requests;
