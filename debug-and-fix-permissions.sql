-- URGENT FIX: Database permission constraint mismatch
-- Your database still has old constraints expecting 'read'/'write' but UI sends 'view'/'edit'/'manage'
-- This script fixes the mismatch

-- 1. First, let's see what's currently in the database
SELECT 'Current shared_ideas permissions:' as info;
SELECT id, permission_level, created_at FROM shared_ideas ORDER BY created_at DESC LIMIT 10;

SELECT 'Current collaboration_requests permissions:' as info;
SELECT id, permission_level, created_at FROM collaboration_requests ORDER BY created_at DESC LIMIT 10;

-- 2. Check what constraints exist
SELECT 'Current constraints:' as info;
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'shared_ideas'::regclass 
   OR conrelid = 'collaboration_requests'::regclass;

-- 3. Drop ALL existing constraints to start fresh
ALTER TABLE shared_ideas DROP CONSTRAINT IF EXISTS shared_ideas_permission_level_check;
ALTER TABLE collaboration_requests DROP CONSTRAINT IF EXISTS collaboration_requests_permission_level_check;

-- 4. Update ALL existing data to use new permission levels
UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level IN ('read', 'Read', 'READ');
UPDATE shared_ideas SET permission_level = 'edit' WHERE permission_level IN ('write', 'Write', 'WRITE');
UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level IS NULL OR permission_level = '';

-- Add permission_level column to collaboration_requests if it doesn't exist
ALTER TABLE collaboration_requests ADD COLUMN IF NOT EXISTS permission_level TEXT DEFAULT 'view';

UPDATE collaboration_requests SET permission_level = 'view' WHERE permission_level IN ('read', 'Read', 'READ') OR permission_level IS NULL OR permission_level = '';
UPDATE collaboration_requests SET permission_level = 'edit' WHERE permission_level IN ('write', 'Write', 'WRITE');

-- 5. Set any remaining invalid values to 'view'
UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level NOT IN ('view', 'edit', 'manage');
UPDATE collaboration_requests SET permission_level = 'view' WHERE permission_level NOT IN ('view', 'edit', 'manage');

-- 6. Now add the constraints back
ALTER TABLE shared_ideas ADD CONSTRAINT shared_ideas_permission_level_check 
CHECK (permission_level IN ('view', 'edit', 'manage'));

ALTER TABLE collaboration_requests ADD CONSTRAINT collaboration_requests_permission_level_check 
CHECK (permission_level IN ('view', 'edit', 'manage'));

-- 7. Verify the fix
SELECT 'After fix - shared_ideas permissions:' as info;
SELECT permission_level, COUNT(*) as count FROM shared_ideas GROUP BY permission_level;

SELECT 'After fix - collaboration_requests permissions:' as info;
SELECT permission_level, COUNT(*) as count FROM collaboration_requests GROUP BY permission_level;

SELECT 'Fix completed successfully!' as status;
