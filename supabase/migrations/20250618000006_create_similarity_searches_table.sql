-- Create similarity_searches table to store cached search results
CREATE TABLE similarity_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    results JSONB NOT NULL DEFAULT '[]',
    total_found INTEGER NOT NULL DEFAULT 0,
    filtered_out INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unique index on idea_id to ensure one search result per idea
CREATE UNIQUE INDEX similarity_searches_idea_id_idx ON similarity_searches(idea_id);

-- Create index on created_at for performance
CREATE INDEX similarity_searches_created_at_idx ON similarity_searches(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE similarity_searches ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own similarity searches
CREATE POLICY "Users can manage their own similarity searches" ON similarity_searches
    FOR ALL USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

-- Create policy for shared ideas - users can view similarity searches for ideas they have access to
CREATE POLICY "Users can view similarity searches for accessible ideas" ON similarity_searches
    FOR SELECT USING (
        idea_id IN (
            SELECT id FROM ideas 
            WHERE user_id = auth.uid() 
            OR id IN (
                SELECT idea_id FROM shared_ideas 
                WHERE collaborator_id = auth.uid()
            )
        )
    );

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_similarity_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_similarity_searches_updated_at
    BEFORE UPDATE ON similarity_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_similarity_searches_updated_at(); 