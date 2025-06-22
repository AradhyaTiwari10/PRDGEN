-- 1. Check if the HNSW index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'product_hunt_products' 
AND indexname LIKE '%embedding%';

-- 2. Update table statistics (crucial for index usage)
ANALYZE product_hunt_products;

-- 3. Test query that should use the HNSW index
-- Using a zero vector of correct dimensions
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, product_description, upvotes
FROM product_hunt_products 
WHERE embedding IS NOT NULL
ORDER BY embedding <-> array_fill(0.0, ARRAY[1536])::vector(1536)
LIMIT 10; 