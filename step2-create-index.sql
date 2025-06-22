-- Step 2: Create memory-efficient index (run this separately)
CREATE INDEX CONCURRENTLY idx_product_hunt_products_embedding_efficient
ON product_hunt_products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); 