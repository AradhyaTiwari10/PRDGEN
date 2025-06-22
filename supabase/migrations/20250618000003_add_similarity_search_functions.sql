-- SQL function to match startup ideas using text-based similarity
-- Works with the existing 'ideas' table structure

-- Text-based search function for the current ideas table
CREATE OR REPLACE FUNCTION match_ideas_text_search(
  search_query text,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  user_id uuid,
  created_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.description,
    i.category,
    i.user_id,
    i.created_at,
    -- Simple text similarity based on word matching
    CASE 
      WHEN i.title ILIKE '%' || search_query || '%' THEN 0.9
      WHEN i.description ILIKE '%' || search_query || '%' THEN 0.7
      ELSE 0.3
    END as similarity
  FROM ideas i
  WHERE 
    i.title ILIKE '%' || search_query || '%' 
    OR i.description ILIKE '%' || search_query || '%'
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION match_ideas_text_search TO authenticated;
GRANT EXECUTE ON FUNCTION match_ideas_text_search TO anon; 