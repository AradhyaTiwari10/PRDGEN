-- Step 3: Analyze table and test index
ANALYZE product_hunt_products;

-- Check index was created successfully
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'product_hunt_products' 
AND indexname = 'idx_product_hunt_products_embedding_efficient';

-- Test query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT name, description, embedding <=> '[0,0,0]'::vector as distance
FROM product_hunt_products 
ORDER BY embedding <=> '[0,0,0]'::vector 
LIMIT 10; 