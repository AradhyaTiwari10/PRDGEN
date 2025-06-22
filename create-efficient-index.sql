-- Memory-Efficient Vector Index Creation
-- This script creates a smaller index to work within memory constraints

-- First, let's check current settings
SHOW maintenance_work_mem;

-- Create a smaller, more memory-efficient index
-- Using fewer lists to reduce memory requirements
CREATE INDEX CONCURRENTLY idx_product_hunt_products_embedding_efficient
ON product_hunt_products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Analyze the table to update statistics
ANALYZE product_hunt_products;

-- Optional: Check index size after creation
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE tablename = 'product_hunt_products';

-- Test the index with a sample query
EXPLAIN (ANALYZE, BUFFERS) 
SELECT name, description, embedding <=> '[0,0,0]'::vector as distance
FROM product_hunt_products 
ORDER BY embedding <=> '[0,0,0]'::vector 
LIMIT 10; 