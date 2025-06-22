-- Optimized index for 120,000+ records
-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_product_hunt_products_embedding;

-- Create optimized index for large dataset
-- Rule of thumb: lists = sqrt(total_rows)
-- For 120k records: sqrt(120000) ≈ 346
CREATE INDEX idx_product_hunt_products_embedding_optimized 
ON product_hunt_products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 350);

-- Alternative: Use HNSW index for even better performance (if available)
-- HNSW is generally faster for large datasets
/*
CREATE INDEX idx_product_hunt_products_embedding_hnsw 
ON product_hunt_products 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
*/

-- Analyze the table to update statistics
ANALYZE product_hunt_products; 