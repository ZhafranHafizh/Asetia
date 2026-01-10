-- Check all transaction_items for Budiman's products
SELECT 
    ti.id,
    ti.product_id,
    p.title as product_title,
    ti.price_at_purchase,
    t.status,
    t.created_at,
    t.buyer_id
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
JOIN transactions t ON ti.transaction_id = t.id
WHERE p.seller_id = 'cee6b2b2-e851-4ffd-b106-ba296bed1a9f'
ORDER BY t.created_at DESC;

-- Check RLS policies on transaction_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'transaction_items';

-- Test if we can select from transaction_items directly
SELECT COUNT(*) FROM transaction_items;
