-- SQL function to match startup ideas using vector similarity
-- Updated to work with the existing 'ideas' table structure

-- First, let's create a simple text-based search function for the current ideas table
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

-- Future function for when embeddings are added to the ideas table
-- This will be ready when we add an 'embedding' column to the ideas table
CREATE OR REPLACE FUNCTION match_ideas_vector_similarity(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
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
  -- This function will work once we add embeddings to the ideas table
  -- For now, it will return empty results
  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.description,
    i.category,
    i.user_id,
    i.created_at,
    0.0::float as similarity
  FROM ideas i
  WHERE false -- Disabled until embeddings are added
  LIMIT 0;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION match_ideas_text_search TO authenticated;
GRANT EXECUTE ON FUNCTION match_ideas_text_search TO anon;
GRANT EXECUTE ON FUNCTION match_ideas_vector_similarity TO authenticated;
GRANT EXECUTE ON FUNCTION match_ideas_vector_similarity TO anon;

-- Note: To enable vector similarity search on ideas, you would need to:
-- 1. Add an embedding column: ALTER TABLE ideas ADD COLUMN embedding vector(1536);
-- 2. Create an index: CREATE INDEX idx_ideas_embedding ON ideas USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- 3. Populate embeddings for existing ideas
-- 4. Update the match_ideas_vector_similarity function to use the embedding column

-- SQL function to match startup ideas using vector similarity
-- This function uses pgvector's cosine distance operator (<->) for similarity search

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

-- Alternative version using cosine similarity operator (<#>) if preferred
-- Uncomment the function below if you want to use cosine similarity directly

/*
CREATE OR REPLACE FUNCTION match_startup_ideas_cosine(
  query_embedding vector(1536),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  name text,
  product_description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ph.id,
    ph.name,
    ph.product_description,
    -- Using cosine similarity operator (<#>)
    -- Returns values between -1 and 1, where 1 = identical
    (ph.embedding <#> query_embedding) AS similarity
  FROM product_hunt_products ph
  WHERE 
    ph.embedding IS NOT NULL 
    AND ph.product_description IS NOT NULL
  ORDER BY ph.embedding <#> query_embedding DESC
  LIMIT match_count;
END;
$$;
*/

-- Create an index to speed up vector similarity searches
-- This is crucial for performance with large datasets
CREATE INDEX IF NOT EXISTS idx_product_hunt_products_embedding 
ON product_hunt_products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT EXECUTE ON FUNCTION match_startup_ideas TO authenticated;
-- GRANT EXECUTE ON FUNCTION match_startup_ideas TO anon; 