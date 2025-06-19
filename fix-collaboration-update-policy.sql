-- Fix RLS policy for ideas table to allow collaborators with 'edit' permission to update shared ideas
-- This fixes the issue where User B cannot save edits to shared ideas

-- 1. First, let's check current permission levels in the database
SELECT 'Current permission levels in shared_ideas:' as info;
SELECT DISTINCT permission_level, COUNT(*) as count 
FROM shared_ideas 
GROUP BY permission_level;

-- 2. Update any remaining 'write' permissions to 'edit' (if any exist)
UPDATE shared_ideas SET permission_level = 'edit' WHERE permission_level = 'write';
UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level = 'read';

-- 3. Drop the existing UPDATE policy for ideas that checks for 'write' permission
DROP POLICY IF EXISTS "Collaborators can update shared ideas with write permission" ON ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;

-- 4. Create new UPDATE policy that checks for 'edit' permission
CREATE POLICY "Users can update their own ideas or shared ideas with edit permission" ON ideas
FOR UPDATE
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM shared_ideas 
        WHERE shared_ideas.idea_id = ideas.id 
        AND shared_ideas.collaborator_id = auth.uid()
        AND shared_ideas.permission_level IN ('edit', 'manage')
    )
);

-- 5. Verify the policy was created correctly
SELECT 'Verifying RLS policies for ideas table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'ideas' AND cmd = 'UPDATE';

-- 6. Check permission levels after update
SELECT 'Permission levels after fix:' as info;
SELECT DISTINCT permission_level, COUNT(*) as count 
FROM shared_ideas 
GROUP BY permission_level;

SELECT 'Fix completed! Collaborators with edit permission should now be able to update shared ideas.' as status;
