-- Fix RLS policy for ideas table to allow collaborators with 'edit' permission to update shared ideas
-- This fixes the issue where User B cannot save edits to shared ideas

-- Update any remaining 'write' permissions to 'edit' (if any exist)
-- First check if shared_ideas table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shared_ideas') THEN
        UPDATE shared_ideas SET permission_level = 'edit' WHERE permission_level = 'write';
        UPDATE shared_ideas SET permission_level = 'view' WHERE permission_level = 'read';
    END IF;
END
$$;

-- Drop the existing UPDATE policy for ideas that might check for 'write' permission
DROP POLICY IF EXISTS "Collaborators can update shared ideas with write permission" ON ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;

-- Create new UPDATE policy that checks for 'edit' permission
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
