-- Optimize collaboration system for BlockNote editor
-- This migration ensures proper indexes and policies for real-time collaboration

-- Add index for faster collaboration queries
CREATE INDEX IF NOT EXISTS idx_shared_ideas_collaborator_idea 
ON shared_ideas(collaborator_id, idea_id);

CREATE INDEX IF NOT EXISTS idx_collaboration_requests_recipient_status 
ON collaboration_requests(recipient_id, status) 
WHERE status = 'pending';

-- Add function to get collaborative editing sessions
CREATE OR REPLACE FUNCTION get_active_editing_sessions(idea_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  last_activity TIMESTAMP
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    s.user_email,
    s.user_name,
    s.last_activity
  FROM idea_editing_sessions s
  WHERE s.idea_id = idea_uuid 
    AND s.last_activity > NOW() - INTERVAL '5 minutes'
  ORDER BY s.last_activity DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_active_editing_sessions(UUID) TO authenticated;

-- Add function to update editing session
CREATE OR REPLACE FUNCTION update_editing_session(
  idea_uuid UUID,
  session_user_id UUID,
  session_user_email TEXT,
  session_user_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO idea_editing_sessions (
    idea_id,
    user_id,
    user_email,
    user_name,
    last_activity,
    created_at
  ) VALUES (
    idea_uuid,
    session_user_id,
    session_user_email,
    session_user_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (idea_id, user_id)
  DO UPDATE SET
    last_activity = NOW(),
    user_email = EXCLUDED.user_email,
    user_name = EXCLUDED.user_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_editing_session(UUID, UUID, TEXT, TEXT) TO authenticated;

-- Clean up old editing sessions (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_editing_sessions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM idea_editing_sessions 
  WHERE last_activity < NOW() - INTERVAL '1 hour';
END;
$$;

-- Create a trigger to automatically clean up old sessions
CREATE OR REPLACE FUNCTION trigger_cleanup_old_sessions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only cleanup occasionally to avoid performance impact
  IF random() < 0.1 THEN
    PERFORM cleanup_old_editing_sessions();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on session updates
DROP TRIGGER IF EXISTS cleanup_sessions_trigger ON idea_editing_sessions;
CREATE TRIGGER cleanup_sessions_trigger
  AFTER INSERT OR UPDATE ON idea_editing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_old_sessions();

-- Try to enable real-time for editing sessions table (ignore if already exists)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE idea_editing_sessions;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Table already in publication, skip
      NULL;
  END;
END $$;

-- Success notification
SELECT 'Collaboration system optimized for BlockNote editor!' as status; 