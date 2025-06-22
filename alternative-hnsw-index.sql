-- Alternative: HNSW index (more memory efficient than IVFFlat)
-- HNSW typically uses less memory during creation
CREATE INDEX CONCURRENTLY idx_product_hunt_products_embedding_hnsw
ON product_hunt_products 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64); 