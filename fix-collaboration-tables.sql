-- =====================================================
-- FIX COLLABORATION TABLES - ADD REQUESTER EMAIL
-- =====================================================
-- Run this script if you already created the collaboration tables
-- This adds the missing requester_email column

-- Check if the table exists and add the column if missing
DO $$
BEGIN
    -- Add requester_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'collaboration_requests' 
        AND column_name = 'requester_email'
    ) THEN
        ALTER TABLE collaboration_requests 
        ADD COLUMN requester_email TEXT;
        
        -- Update existing records with requester email from auth.users
        -- This is a one-time fix for existing data
        UPDATE collaboration_requests 
        SET requester_email = COALESCE(
            (SELECT email FROM auth.users WHERE id = collaboration_requests.requester_id),
            'unknown@example.com'
        )
        WHERE requester_email IS NULL;
        
        -- Make the column NOT NULL after updating existing data
        ALTER TABLE collaboration_requests 
        ALTER COLUMN requester_email SET NOT NULL;
        
        RAISE NOTICE 'Added requester_email column to collaboration_requests table';
    ELSE
        RAISE NOTICE 'requester_email column already exists in collaboration_requests table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Collaboration tables fix completed successfully!';
    RAISE NOTICE 'The requester_email column is now available';
    RAISE NOTICE 'You can now send collaboration requests properly';
END $$;
