-- =====================================================
-- CLEANUP COLLABORATION DATA - FIX INCONSISTENCIES
-- =====================================================
-- Run this script to clean up any inconsistent collaboration data

-- Step 1: Remove collaboration requests that are marked as 'accepted' 
-- but don't have corresponding entries in shared_ideas
DELETE FROM collaboration_requests 
WHERE status = 'accepted' 
AND id NOT IN (
    SELECT cr.id 
    FROM collaboration_requests cr
    INNER JOIN shared_ideas si 
    ON cr.idea_id = si.idea_id 
    AND cr.recipient_id = si.collaborator_id
    WHERE cr.status = 'accepted'
);

-- Step 2: Remove any duplicate collaboration requests for the same idea/recipient
-- Keep only the most recent one
WITH ranked_requests AS (
    SELECT id, 
           ROW_NUMBER() OVER (
               PARTITION BY idea_id, recipient_id 
               ORDER BY created_at DESC
           ) as rn
    FROM collaboration_requests
)
DELETE FROM collaboration_requests 
WHERE id IN (
    SELECT id FROM ranked_requests WHERE rn > 1
);

-- Step 3: Update any 'accepted' requests that don't have shared_ideas entries
-- back to 'pending' so they can be re-accepted
UPDATE collaboration_requests 
SET status = 'pending', 
    updated_at = NOW()
WHERE status = 'accepted' 
AND NOT EXISTS (
    SELECT 1 FROM shared_ideas 
    WHERE shared_ideas.idea_id = collaboration_requests.idea_id 
    AND shared_ideas.collaborator_id = collaboration_requests.recipient_id
);

-- Step 4: Remove any shared_ideas entries that don't have corresponding ideas
DELETE FROM shared_ideas 
WHERE idea_id NOT IN (SELECT id FROM ideas);

-- Step 5: Remove any collaboration_requests that don't have corresponding ideas
DELETE FROM collaboration_requests 
WHERE idea_id NOT IN (SELECT id FROM ideas);

-- Step 6: Remove any collaboration_requests where the requester or recipient no longer exists
DELETE FROM collaboration_requests 
WHERE requester_id NOT IN (SELECT id FROM auth.users)
OR recipient_id NOT IN (SELECT id FROM auth.users);

-- Step 7: Remove any shared_ideas where the owner or collaborator no longer exists
DELETE FROM shared_ideas
WHERE owner_id NOT IN (SELECT id FROM auth.users)
OR collaborator_id NOT IN (SELECT id FROM auth.users);

-- Verification queries to check the cleanup results
DO $$
DECLARE
    orphaned_requests INTEGER;
    orphaned_shared INTEGER;
    duplicate_requests INTEGER;
BEGIN
    -- Check for orphaned accepted requests
    SELECT COUNT(*) INTO orphaned_requests
    FROM collaboration_requests 
    WHERE status = 'accepted' 
    AND NOT EXISTS (
        SELECT 1 FROM shared_ideas 
        WHERE shared_ideas.idea_id = collaboration_requests.idea_id 
        AND shared_ideas.collaborator_id = collaboration_requests.recipient_id
    );
    
    -- Check for orphaned shared ideas
    SELECT COUNT(*) INTO orphaned_shared
    FROM shared_ideas 
    WHERE idea_id NOT IN (SELECT id FROM ideas);
    
    -- Check for duplicate requests
    WITH unique_pairs AS (
        SELECT DISTINCT idea_id, recipient_id FROM collaboration_requests
    )
    SELECT (SELECT COUNT(*) FROM collaboration_requests) - (SELECT COUNT(*) FROM unique_pairs) INTO duplicate_requests;
    
    RAISE NOTICE 'Cleanup completed successfully!';
    RAISE NOTICE 'Orphaned accepted requests: %', orphaned_requests;
    RAISE NOTICE 'Orphaned shared ideas: %', orphaned_shared;
    RAISE NOTICE 'Duplicate requests: %', duplicate_requests;
    
    IF orphaned_requests = 0 AND orphaned_shared = 0 AND duplicate_requests = 0 THEN
        RAISE NOTICE 'All collaboration data is now consistent!';
    ELSE
        RAISE NOTICE 'Some issues may still exist. Please review the data manually.';
    END IF;
END $$;
