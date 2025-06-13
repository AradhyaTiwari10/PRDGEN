-- Create idea_collections table
CREATE TABLE idea_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ideas table
CREATE TABLE ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'ready_for_prd', 'archived')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    market_size TEXT,
    competition TEXT,
    notes TEXT,
    attachments TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create PRDs table
CREATE TABLE prds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_idea TEXT NOT NULL,
    generated_prd TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'final', 'archived')),
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for idea_collections
ALTER TABLE idea_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections"
    ON idea_collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
    ON idea_collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON idea_collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON idea_collections FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for ideas
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ideas"
    ON ideas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas"
    ON ideas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
    ON ideas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
    ON ideas FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for PRDs
ALTER TABLE prds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PRDs"
    ON prds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PRDs"
    ON prds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PRDs"
    ON prds FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PRDs"
    ON prds FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_priority ON ideas(priority);
CREATE INDEX idx_ideas_created_at ON ideas(created_at);

CREATE INDEX idx_idea_collections_user_id ON idea_collections(user_id);
CREATE INDEX idx_idea_collections_created_at ON idea_collections(created_at);

CREATE INDEX idx_prds_user_id ON prds(user_id);
CREATE INDEX idx_prds_status ON prds(status);
CREATE INDEX idx_prds_created_at ON prds(created_at);

-- Create idea_conversations table for AI assistant chat history
CREATE TABLE idea_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for idea_conversations
ALTER TABLE idea_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
    ON idea_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON idea_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON idea_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON idea_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for idea_conversations
CREATE INDEX idx_idea_conversations_idea_id ON idea_conversations(idea_id);
CREATE INDEX idx_idea_conversations_user_id ON idea_conversations(user_id);
CREATE INDEX idx_idea_conversations_created_at ON idea_conversations(created_at);

-- Create function to delete PRD
CREATE OR REPLACE FUNCTION delete_prd(prd_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get the current user's ID
    v_user_id := auth.uid();

    -- Delete the PRD if it belongs to the current user
    DELETE FROM prds
    WHERE id = prd_id
    AND user_id = v_user_id;

    -- If no rows were affected, raise an error
    IF NOT FOUND THEN
        RAISE EXCEPTION 'PRD not found or you do not have permission to delete it';
    END IF;
END;
$$;