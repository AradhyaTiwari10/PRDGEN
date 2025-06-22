-- Create collaboration_requests table
CREATE TABLE collaboration_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(idea_id, recipient_id)
);

-- Create shared_ideas table
CREATE TABLE shared_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    collaborator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'manage')) DEFAULT 'view',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(idea_id, collaborator_id)
);

-- Create RLS policies for collaboration_requests
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view requests they sent or received"
    ON collaboration_requests FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create collaboration requests"
    ON collaboration_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipients can update request status"
    ON collaboration_requests FOR UPDATE
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete requests they sent"
    ON collaboration_requests FOR DELETE
    USING (auth.uid() = requester_id);

-- Create RLS policies for shared_ideas
ALTER TABLE shared_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shared ideas they own or collaborate on"
    ON shared_ideas FOR SELECT
    USING (auth.uid() = owner_id OR auth.uid() = collaborator_id);

CREATE POLICY "Idea owners can share their ideas"
    ON shared_ideas FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Idea owners can update sharing permissions"
    ON shared_ideas FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Idea owners can remove collaborators"
    ON shared_ideas FOR DELETE
    USING (auth.uid() = owner_id);

-- Create indexes for collaboration tables
CREATE INDEX idx_collaboration_requests_requester_id ON collaboration_requests(requester_id);
CREATE INDEX idx_collaboration_requests_recipient_id ON collaboration_requests(recipient_id);
CREATE INDEX idx_collaboration_requests_idea_id ON collaboration_requests(idea_id);
CREATE INDEX idx_collaboration_requests_status ON collaboration_requests(status);
CREATE INDEX idx_collaboration_requests_created_at ON collaboration_requests(created_at);

CREATE INDEX idx_shared_ideas_idea_id ON shared_ideas(idea_id);
CREATE INDEX idx_shared_ideas_owner_id ON shared_ideas(owner_id);
CREATE INDEX idx_shared_ideas_collaborator_id ON shared_ideas(collaborator_id);
CREATE INDEX idx_shared_ideas_created_at ON shared_ideas(created_at);

-- Update ideas RLS policies to include shared access
DROP POLICY "Users can view their own ideas" ON ideas;
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

-- Create policy for collaborators to update shared ideas (edit or manage permission)
CREATE POLICY "Collaborators can update shared ideas with edit permission"
    ON ideas FOR UPDATE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM shared_ideas
            WHERE shared_ideas.idea_id = ideas.id
            AND shared_ideas.collaborator_id = auth.uid()
            AND shared_ideas.permission_level IN ('edit', 'manage')
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