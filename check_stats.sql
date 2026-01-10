-- Check the current definition of seller_stats view
SELECT pg_get_viewdef('public.seller_stats'::regclass, true);

-- Check actual data from the view
SELECT * FROM seller_stats;

-- Manually calculate what the stats should be
SELECT 
    p.seller_id,
    COUNT(DISTINCT ti.id) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_items_sold,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_transactions,
    SUM(ti.price_at_purchase) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_earnings
FROM products p
LEFT JOIN transaction_items ti ON ti.product_id = p.id
LEFT JOIN transactions t ON ti.transaction_id = t.id
GROUP BY p.seller_id;
