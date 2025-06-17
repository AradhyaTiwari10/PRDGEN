-- Fix for collaboration RLS issue
-- This creates a function that can get idea titles for collaboration requests
-- bypassing RLS restrictions

-- Create a function to get idea title for collaboration requests
CREATE OR REPLACE FUNCTION get_idea_title_for_collaboration(request_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
    idea_title TEXT;
    request_idea_id UUID;
BEGIN
    -- Get the idea_id from the collaboration request
    SELECT idea_id INTO request_idea_id
    FROM collaboration_requests
    WHERE id = request_id;
    
    -- If no request found, return null
    IF request_idea_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get the idea title (bypassing RLS due to SECURITY DEFINER)
    SELECT title INTO idea_title
    FROM ideas
    WHERE id = request_idea_id;
    
    RETURN COALESCE(idea_title, 'Untitled Idea');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_idea_title_for_collaboration(UUID) TO authenticated;

-- Alternative: Update RLS policy to allow collaborators to see ideas they have requests for
-- This is a more comprehensive fix

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view ideas they have collaboration requests for" ON ideas;

-- Create new policy to allow viewing ideas for collaboration requests
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

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'ideas';
