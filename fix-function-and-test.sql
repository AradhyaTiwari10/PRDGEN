-- Fix 1: Drop and recreate the function with correct signature
DROP FUNCTION IF EXISTS match_startup_ideas(vector, double precision, integer);

-- Recreate function with correct column names
CREATE OR REPLACE FUNCTION match_startup_ideas(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  name text,
  product_description text,
  upvotes int,
  category_tags text,
  websites text,
  makers text,
  created_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pph.id::bigint,
    pph.name,
    pph.product_description,
    pph.upvotes,
    pph.category_tags,
    pph.websites,
    pph.makers,
    pph.created_at,
    (1 - (pph.embedding <-> query_embedding)) as similarity
  FROM product_hunt_products pph
  WHERE pph.embedding IS NOT NULL
    AND (1 - (pph.embedding <-> query_embedding)) >= match_threshold
  ORDER BY pph.embedding <-> query_embedding
  LIMIT match_count;
END;
$$; 