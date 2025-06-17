-- =====================================================
-- COLLABORATION FEATURE SETUP FOR SUPABASE
-- =====================================================
-- Run this script in your Supabase SQL Editor to set up the collaboration feature

-- Create collaboration_requests table
CREATE TABLE IF NOT EXISTS collaboration_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requester_email TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(idea_id, recipient_id)
);

-- Create shared_ideas table
CREATE TABLE IF NOT EXISTS shared_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    collaborator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('read', 'write')) DEFAULT 'read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(idea_id, collaborator_id)
);

-- Enable RLS for collaboration_requests
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for collaboration_requests
DROP POLICY IF EXISTS "Users can view requests they sent or received" ON collaboration_requests;
CREATE POLICY "Users can view requests they sent or received"
    ON collaboration_requests FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can create collaboration requests" ON collaboration_requests;
CREATE POLICY "Users can create collaboration requests"
    ON collaboration_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Recipients can update request status" ON collaboration_requests;
CREATE POLICY "Recipients can update request status"
    ON collaboration_requests FOR UPDATE
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can delete requests they sent" ON collaboration_requests;
CREATE POLICY "Users can delete requests they sent"
    ON collaboration_requests FOR DELETE
    USING (auth.uid() = requester_id);

-- Enable RLS for shared_ideas
ALTER TABLE shared_ideas ENABLE ROW LEVEL SECURITY;

-- RLS policies for shared_ideas
DROP POLICY IF EXISTS "Users can view shared ideas they own or collaborate on" ON shared_ideas;
CREATE POLICY "Users can view shared ideas they own or collaborate on"
    ON shared_ideas FOR SELECT
    USING (auth.uid() = owner_id OR auth.uid() = collaborator_id);

DROP POLICY IF EXISTS "Idea owners can share their ideas" ON shared_ideas;
CREATE POLICY "Idea owners can share their ideas"
    ON shared_ideas FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Idea owners can update sharing permissions" ON shared_ideas;
CREATE POLICY "Idea owners can update sharing permissions"
    ON shared_ideas FOR UPDATE
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Idea owners can remove collaborators" ON shared_ideas;
CREATE POLICY "Idea owners can remove collaborators"
    ON shared_ideas FOR DELETE
    USING (auth.uid() = owner_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_requester_id ON collaboration_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_recipient_id ON collaboration_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_idea_id ON collaboration_requests(idea_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_status ON collaboration_requests(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_created_at ON collaboration_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_shared_ideas_idea_id ON shared_ideas(idea_id);
CREATE INDEX IF NOT EXISTS idx_shared_ideas_owner_id ON shared_ideas(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_ideas_collaborator_id ON shared_ideas(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_shared_ideas_created_at ON shared_ideas(created_at);

-- Update ideas RLS policies to include shared access
DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can view their own ideas or shared ideas" ON ideas;
CREATE POLICY "Users can view their own ideas or shared ideas"
    ON ideas FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM shared_ideas 
            WHERE shared_ideas.idea_id = ideas.id 
            AND shared_ideas.collaborator_id = auth.uid()
        )
    );

-- Create policy for collaborators to update shared ideas (write permission only)
DROP POLICY IF EXISTS "Collaborators can update shared ideas with write permission" ON ideas;
CREATE POLICY "Collaborators can update shared ideas with write permission"
    ON ideas FOR UPDATE
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM shared_ideas 
            WHERE shared_ideas.idea_id = ideas.id 
            AND shared_ideas.collaborator_id = auth.uid()
            AND shared_ideas.permission_level = 'write'
        )
    );

-- Create function to get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE(id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT au.id, au.email
    FROM auth.users au
    WHERE au.email = user_email;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON collaboration_requests TO authenticated;
GRANT ALL ON shared_ideas TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Collaboration feature setup completed successfully!';
    RAISE NOTICE 'Tables created: collaboration_requests, shared_ideas';
    RAISE NOTICE 'RLS policies applied for secure access';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Function get_user_by_email created';
END $$;
