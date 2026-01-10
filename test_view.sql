-- Check if view exists
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%sales%';

-- Test the view directly
SELECT * FROM seller_sales_list_view LIMIT 5;

-- Check seller_stats view
SELECT * FROM seller_stats;
