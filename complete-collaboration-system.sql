-- Complete collaboration system with notifications and enhanced permissions
-- Run this script in Supabase SQL Editor to set up the full system

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('collaboration_removed', 'collaboration_invited', 'collaboration_accepted', 'permission_changed')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications
FOR DELETE USING (auth.uid() = user_id);

-- 2. Update existing data FIRST, then apply constraints
-- Check and update existing data in shared_ideas
DO $$
BEGIN
    -- Update existing data to use new permission levels
    UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level = 'read';
    UPDATE shared_ideas SET permission_level = 'edit' WHERE permission_level = 'write';
    UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level IS NULL;
    UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level NOT IN ('view', 'edit', 'manage');

    -- Drop existing constraint if it exists
    ALTER TABLE shared_ideas DROP CONSTRAINT IF EXISTS shared_ideas_permission_level_check;

    -- Add new constraint with updated permission levels
    ALTER TABLE shared_ideas ADD CONSTRAINT shared_ideas_permission_level_check
    CHECK (permission_level IN ('view', 'edit', 'manage'));
EXCEPTION
    WHEN OTHERS THEN
        -- If table doesn't exist or other error, continue
        RAISE NOTICE 'shared_ideas table update failed: %', SQLERRM;
END $$;

-- Update collaboration_requests table
DO $$
BEGIN
    -- Add permission_level column if it doesn't exist
    ALTER TABLE collaboration_requests ADD COLUMN IF NOT EXISTS permission_level TEXT DEFAULT 'view';

    -- Update existing data
    UPDATE collaboration_requests SET permission_level = 'view' WHERE permission_level = 'read' OR permission_level IS NULL;
    UPDATE collaboration_requests SET permission_level = 'edit' WHERE permission_level = 'write';
    UPDATE collaboration_requests SET permission_level = 'view' WHERE permission_level NOT IN ('view', 'edit', 'manage');

    -- Drop existing constraint if it exists
    ALTER TABLE collaboration_requests DROP CONSTRAINT IF EXISTS collaboration_requests_permission_level_check;

    -- Add new constraint
    ALTER TABLE collaboration_requests ADD CONSTRAINT collaboration_requests_permission_level_check
    CHECK (permission_level IN ('view', 'edit', 'manage'));
EXCEPTION
    WHEN OTHERS THEN
        -- If table doesn't exist or other error, continue
        RAISE NOTICE 'collaboration_requests table update failed: %', SQLERRM;
END $$;

-- 3. Create notification management functions
CREATE OR REPLACE FUNCTION create_notification(
    target_user_id UUID,
    notification_type TEXT,
    notification_title TEXT,
    notification_message TEXT,
    notification_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (target_user_id, notification_type, notification_title, notification_message, notification_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notifications 
    SET read = TRUE 
    WHERE id = notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET read = TRUE 
    WHERE user_id = auth.uid() AND read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- 4. Create user lookup functions (if they don't exist)
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

-- 5. Create idea title lookup function for collaboration
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

-- 6. Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email_reverse(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_idea_title_for_collaboration(UUID) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;

-- 7. Data already updated above, this section is now redundant

-- 8. Update RLS policies for ideas table to allow collaboration access
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

-- 9. Fix any existing data issues
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

-- 10. Clean up any orphaned data
-- Remove collaboration requests where users no longer exist
DELETE FROM collaboration_requests 
WHERE requester_id NOT IN (SELECT id FROM auth.users)
   OR recipient_id NOT IN (SELECT id FROM auth.users);

-- Remove shared_ideas where users no longer exist
DELETE FROM shared_ideas 
WHERE owner_id NOT IN (SELECT id FROM auth.users)
   OR collaborator_id NOT IN (SELECT id FROM auth.users);

-- 11. Verification queries
SELECT 'Setup Complete!' as status;
SELECT 'Notifications table' as component, COUNT(*) as record_count FROM notifications;
SELECT 'Collaboration Requests' as component, COUNT(*) as record_count FROM collaboration_requests;
SELECT 'Shared Ideas' as component, COUNT(*) as record_count FROM shared_ideas;

-- Check for any remaining data issues
SELECT 
    'Data Quality Check' as check_type,
    COUNT(CASE WHEN requester_email LIKE '%example.com%' THEN 1 END) as example_com_requester,
    COUNT(CASE WHEN recipient_email LIKE '%example.com%' THEN 1 END) as example_com_recipient,
    COUNT(CASE WHEN requester_email IS NULL OR requester_email = '' THEN 1 END) as empty_requester,
    COUNT(CASE WHEN recipient_email IS NULL OR recipient_email = '' THEN 1 END) as empty_recipient
FROM collaboration_requests;
