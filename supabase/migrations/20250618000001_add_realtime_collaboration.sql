-- Add real-time collaboration support for ideas
-- This enables live editing with user presence and cursor tracking

-- Create table for tracking active editing sessions
CREATE TABLE IF NOT EXISTS idea_editing_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    cursor_position INTEGER DEFAULT 0,
    selection_start INTEGER,
    selection_end INTEGER,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(idea_id, user_id)
);

-- Create table for storing content change history (optional, for conflict resolution)
CREATE TABLE IF NOT EXISTS idea_content_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_delta JSONB, -- Store content changes as delta/diff
    cursor_position INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_idea_editing_sessions_idea_id ON idea_editing_sessions(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_editing_sessions_user_id ON idea_editing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_editing_sessions_last_activity ON idea_editing_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_idea_content_changes_idea_id ON idea_content_changes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_content_changes_timestamp ON idea_content_changes(timestamp);

-- Enable RLS for editing sessions
ALTER TABLE idea_editing_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for editing sessions
CREATE POLICY "Users can view editing sessions for ideas they have access to" ON idea_editing_sessions
FOR SELECT
USING (
    -- User can see sessions for ideas they own
    idea_id IN (
        SELECT id FROM ideas WHERE user_id = auth.uid()
    )
    OR
    -- User can see sessions for ideas they collaborate on
    idea_id IN (
        SELECT idea_id FROM shared_ideas WHERE collaborator_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their own editing sessions" ON idea_editing_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable RLS for content changes
ALTER TABLE idea_content_changes ENABLE ROW LEVEL SECURITY;

-- RLS policies for content changes
CREATE POLICY "Users can view content changes for ideas they have access to" ON idea_content_changes
FOR SELECT
USING (
    -- User can see changes for ideas they own
    idea_id IN (
        SELECT id FROM ideas WHERE user_id = auth.uid()
    )
    OR
    -- User can see changes for ideas they collaborate on
    idea_id IN (
        SELECT idea_id FROM shared_ideas WHERE collaborator_id = auth.uid()
    )
);

CREATE POLICY "Users can insert content changes for ideas they can edit" ON idea_content_changes
FOR INSERT
WITH CHECK (
    -- User can add changes for ideas they own
    idea_id IN (
        SELECT id FROM ideas WHERE user_id = auth.uid()
    )
    OR
    -- User can add changes for ideas they can edit
    idea_id IN (
        SELECT idea_id FROM shared_ideas 
        WHERE collaborator_id = auth.uid() 
        AND permission_level IN ('edit', 'manage')
    )
);

-- Function to clean up old editing sessions (inactive for more than 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_inactive_editing_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM idea_editing_sessions 
    WHERE last_activity < NOW() - INTERVAL '5 minutes';
END;
$$;

-- Function to update editing session activity
CREATE OR REPLACE FUNCTION update_editing_session(
    p_idea_id UUID,
    p_user_id UUID,
    p_user_email TEXT,
    p_user_name TEXT,
    p_cursor_position INTEGER DEFAULT 0,
    p_selection_start INTEGER DEFAULT NULL,
    p_selection_end INTEGER DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO idea_editing_sessions (
        idea_id, user_id, user_email, user_name, 
        cursor_position, selection_start, selection_end, last_activity
    )
    VALUES (
        p_idea_id, p_user_id, p_user_email, p_user_name,
        p_cursor_position, p_selection_start, p_selection_end, NOW()
    )
    ON CONFLICT (idea_id, user_id)
    DO UPDATE SET
        cursor_position = EXCLUDED.cursor_position,
        selection_start = EXCLUDED.selection_start,
        selection_end = EXCLUDED.selection_end,
        last_activity = NOW();
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_inactive_editing_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION update_editing_session(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER) TO authenticated;

-- Enable realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE idea_editing_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE idea_content_changes;

-- Create a trigger to automatically clean up old sessions periodically
-- This will run every time someone updates their session
CREATE OR REPLACE FUNCTION trigger_cleanup_sessions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only run cleanup occasionally to avoid performance issues
    IF random() < 0.1 THEN -- 10% chance
        PERFORM cleanup_inactive_editing_sessions();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_sessions_trigger
    AFTER INSERT OR UPDATE ON idea_editing_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cleanup_sessions();

-- Verification
SELECT 'Real-time collaboration tables created successfully!' as status;
