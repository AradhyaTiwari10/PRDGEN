-- Check the actual table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_hunt_products' 
ORDER BY ordinal_position; 