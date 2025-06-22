-- Memory-efficient index for 120,000+ records
-- This version uses less memory during creation

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_product_hunt_products_embedding;
DROP INDEX IF EXISTS idx_product_hunt_products_embedding_optimized;

-- Check current memory settings (for reference)
-- SHOW maintenance_work_mem;

-- Create memory-efficient index
-- Using lists = 100 to stay within 32MB memory limit
-- This still provides excellent performance for 120k records
CREATE INDEX CONCURRENTLY idx_product_hunt_products_embedding_efficient
ON product_hunt_products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Alternative: Try HNSW if available (more memory efficient)
-- Uncomment the following if IVFFlat still fails:
/*
DROP INDEX IF EXISTS idx_product_hunt_products_embedding_efficient;
CREATE INDEX CONCURRENTLY idx_product_hunt_products_embedding_hnsw
ON product_hunt_products 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
*/

-- Update table statistics
ANALYZE product_hunt_products;

-- Verify the index was created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'product_hunt_products' 
    AND indexname LIKE '%embedding%'; 