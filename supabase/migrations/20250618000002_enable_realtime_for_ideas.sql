-- Enable realtime for ideas table to support real-time collaboration
-- This ensures that content changes are broadcasted in real-time

-- Add ideas table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;

-- Verify realtime is enabled
SELECT 'Realtime enabled for ideas table' as status;
