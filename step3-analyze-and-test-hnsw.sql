-- Step 3: Analyze table and test HNSW index
ANALYZE product_hunt_products;

-- Check HNSW index was created successfully
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'product_hunt_products' 
AND indexname = 'idx_product_hunt_products_embedding_hnsw';

-- Check index size
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE relname = 'product_hunt_products'
AND indexrelname = 'idx_product_hunt_products_embedding_hnsw';

-- First, let's check the table structure
\d product_hunt_products;

-- Test query performance with HNSW index
-- Using id and name columns (adjust based on your actual column names)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, embedding <=> '[0,0,0]'::vector as distance
FROM product_hunt_products 
ORDER BY embedding <=> '[0,0,0]'::vector 
LIMIT 10; 