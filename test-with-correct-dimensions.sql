-- Test with a proper 1536-dimensional zero vector
-- First, let's get a real embedding from the database to test with
SELECT id, name, product_description, upvotes
FROM product_hunt_products 
WHERE embedding IS NOT NULL 
LIMIT 1;

-- Test the similarity search with a real embedding
-- This will use the first product's embedding as the query
WITH test_embedding AS (
  SELECT embedding 
  FROM product_hunt_products 
  WHERE embedding IS NOT NULL 
  LIMIT 1
)
SELECT id, name, product_description, similarity
FROM match_startup_ideas(
  (SELECT embedding FROM test_embedding),
  0.5,
  5
)
LIMIT 5;

-- Alternative: Test with performance analysis
EXPLAIN (ANALYZE, BUFFERS) 
WITH test_embedding AS (
  SELECT embedding 
  FROM product_hunt_products 
  WHERE embedding IS NOT NULL 
  LIMIT 1
)
SELECT id, name, product_description, upvotes, embedding <=> (SELECT embedding FROM test_embedding) as distance
FROM product_hunt_products 
WHERE embedding IS NOT NULL
ORDER BY embedding <-> (SELECT embedding FROM test_embedding)
LIMIT 10; 