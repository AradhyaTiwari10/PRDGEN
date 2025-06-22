-- Step 2: Create ultra memory-efficient index (uses only ~16MB)
-- Reducing lists from 100 to 50 to fit within 32MB maintenance_work_mem
CREATE INDEX CONCURRENTLY idx_product_hunt_products_embedding_ultra_efficient
ON product_hunt_products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50); 