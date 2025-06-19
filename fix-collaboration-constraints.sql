-- Fix for collaboration system constraint errors
-- Run this script FIRST to fix existing data, then run the main script

-- 1. First, let's see what permission levels currently exist
SELECT DISTINCT permission_level FROM shared_ideas;
SELECT DISTINCT permission_level FROM collaboration_requests;

-- 2. Update existing data to use new permission levels BEFORE applying constraints
-- Fix shared_ideas table
UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level = 'read';
UPDATE shared_ideas SET permission_level = 'edit' WHERE permission_level = 'write';
UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level IS NULL;
UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level NOT IN ('view', 'edit', 'manage');

-- Fix collaboration_requests table
-- Add column if it doesn't exist
ALTER TABLE collaboration_requests ADD COLUMN IF NOT EXISTS permission_level TEXT DEFAULT 'view';

-- Update existing data
UPDATE collaboration_requests SET permission_level = 'view' WHERE permission_level = 'read' OR permission_level IS NULL;
UPDATE collaboration_requests SET permission_level = 'edit' WHERE permission_level = 'write';
UPDATE collaboration_requests SET permission_level = 'view' WHERE permission_level NOT IN ('view', 'edit', 'manage');

-- 3. Now apply the constraints safely
-- Drop existing constraints first
ALTER TABLE shared_ideas DROP CONSTRAINT IF EXISTS shared_ideas_permission_level_check;
ALTER TABLE collaboration_requests DROP CONSTRAINT IF EXISTS collaboration_requests_permission_level_check;

-- Add new constraints
ALTER TABLE shared_ideas ADD CONSTRAINT shared_ideas_permission_level_check 
CHECK (permission_level IN ('view', 'edit', 'manage'));

ALTER TABLE collaboration_requests ADD CONSTRAINT collaboration_requests_permission_level_check 
CHECK (permission_level IN ('view', 'edit', 'manage'));

-- 4. Verify the fix
SELECT 'Data Updated Successfully!' as status;
SELECT 'shared_ideas permission levels' as table_name, permission_level, COUNT(*) as count 
FROM shared_ideas 
GROUP BY permission_level;

SELECT 'collaboration_requests permission levels' as table_name, permission_level, COUNT(*) as count 
FROM collaboration_requests 
GROUP BY permission_level;
