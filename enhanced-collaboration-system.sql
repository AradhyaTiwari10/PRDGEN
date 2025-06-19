-- Enhanced collaboration system with notifications and improved permissions

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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

-- 2. Update shared_ideas table to support new permission levels
-- First, let's check if we need to update the constraint
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE shared_ideas DROP CONSTRAINT IF EXISTS shared_ideas_permission_level_check;
    
    -- Add new constraint with updated permission levels
    ALTER TABLE shared_ideas ADD CONSTRAINT shared_ideas_permission_level_check 
    CHECK (permission_level IN ('view', 'edit', 'manage'));
EXCEPTION
    WHEN OTHERS THEN
        -- If table doesn't exist or other error, continue
        NULL;
END $$;

-- 3. Update collaboration_requests table to support new permission levels
DO $$
BEGIN
    -- Add permission_level column if it doesn't exist
    ALTER TABLE collaboration_requests ADD COLUMN IF NOT EXISTS permission_level TEXT DEFAULT 'view';
    
    -- Drop existing constraint if it exists
    ALTER TABLE collaboration_requests DROP CONSTRAINT IF EXISTS collaboration_requests_permission_level_check;
    
    -- Add new constraint
    ALTER TABLE collaboration_requests ADD CONSTRAINT collaboration_requests_permission_level_check 
    CHECK (permission_level IN ('view', 'edit', 'manage'));
EXCEPTION
    WHEN OTHERS THEN
        -- If table doesn't exist or other error, continue
        NULL;
END $$;

-- 4. Function to create notification
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- 5. Function to mark notification as read
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;

-- 6. Function to mark all notifications as read for a user
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;

-- 7. Update existing data to use new permission levels
UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level = 'read';
UPDATE shared_ideas SET permission_level = 'edit' WHERE permission_level = 'write';

-- 8. Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;

-- 9. Verification
SELECT 'Notifications table created' as status;
SELECT COUNT(*) as notification_count FROM notifications;
SELECT 'Permission levels updated' as status;
