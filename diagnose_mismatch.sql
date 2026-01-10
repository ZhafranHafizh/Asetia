-- Check what transaction_items actually exist for Budiman's products
SELECT 
    ti.id,
    ti.product_id,
    p.title,
    p.seller_id,
    t.status,
    t.created_at
FROM transaction_items ti
LEFT JOIN products p ON ti.product_id = p.id
LEFT JOIN transactions t ON ti.transaction_id = t.id
WHERE p.seller_id = 'cee6b2b2-e851-4ffd-b106-ba296bed1a9f'
ORDER BY ti.created_at DESC;

-- Check if there are transaction_items with NULL product_id
SELECT COUNT(*) as null_product_count
FROM transaction_items
WHERE product_id IS NULL;

-- Check the seller_stats view definition
SELECT pg_get_viewdef('public.seller_stats'::regclass, true);

-- Manually run the seller_stats logic for Budiman
SELECT 
    p.seller_id,
    COUNT(DISTINCT ti.id) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_items_sold,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_transactions,
    SUM(ti.price_at_purchase) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_earnings
FROM products p
LEFT JOIN transaction_items ti ON ti.product_id = p.id
LEFT JOIN transactions t ON ti.transaction_id = t.id
WHERE p.seller_id = 'cee6b2b2-e851-4ffd-b106-ba296bed1a9f'
GROUP BY p.seller_id;
