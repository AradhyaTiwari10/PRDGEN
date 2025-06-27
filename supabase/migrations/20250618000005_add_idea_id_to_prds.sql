-- Add idea_id column to PRDs table to link PRDs with specific ideas
ALTER TABLE prds ADD COLUMN idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_prds_idea_id ON prds(idea_id);

-- Update RLS policies to allow viewing PRDs linked to shared ideas
-- Users can view PRDs for ideas they own or have access to
DROP POLICY IF EXISTS "Users can view their own PRDs" ON prds;
CREATE POLICY "Users can view their own PRDs or PRDs for shared ideas"
    ON prds FOR SELECT
    USING (
        auth.uid() = user_id OR 
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
            UNION
            SELECT idea_id FROM shared_ideas WHERE collaborator_id = auth.uid()
        )
    ); 