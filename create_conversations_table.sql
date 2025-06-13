-- SQL script to create the idea_conversations table
-- Run this in your Supabase SQL Editor

-- First, let's check if the ideas table exists and get its structure
-- Run this query first to verify the ideas table structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ideas';

-- Create idea_conversations table for AI assistant chat history
-- Make sure the ideas table exists before running this
CREATE TABLE IF NOT EXISTS idea_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key constraints after table creation (safer approach)
-- Only run these if the referenced tables exist
DO $$
BEGIN
    -- Check if ideas table exists and add foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ideas') THEN
        ALTER TABLE idea_conversations
        ADD CONSTRAINT fk_idea_conversations_idea_id
        FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key to auth.users (this should always exist)
    ALTER TABLE idea_conversations
    ADD CONSTRAINT fk_idea_conversations_user_id
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraints already exist, ignore
        NULL;
END $$;

-- Create RLS policies for idea_conversations
ALTER TABLE idea_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own conversations" ON idea_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON idea_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON idea_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON idea_conversations;

-- Create new policies
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
CREATE INDEX IF NOT EXISTS idx_idea_conversations_idea_id ON idea_conversations(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_conversations_user_id ON idea_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_conversations_created_at ON idea_conversations(created_at);
