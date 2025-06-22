-- Check if the HNSW index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'product_hunt_products' 
AND indexname LIKE '%embedding%';

-- Check index statistics
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE relname = 'product_hunt_products'
AND indexrelname LIKE '%embedding%';

-- Force the planner to use the index by setting work_mem higher
SET work_mem = '256MB';

-- Test query that should use the index
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, product_description, upvotes, embedding <-> '[0.1,0.2,0.3]'::vector(3) as distance
FROM product_hunt_products 
WHERE embedding IS NOT NULL
ORDER BY embedding <-> '[0.1,0.2,0.3]'::vector(3)
LIMIT 10;

-- Reset work_mem
RESET work_mem; 