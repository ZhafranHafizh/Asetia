-- Check recent transaction items
SELECT 
    ti.id, 
    ti.created_at, 
    ti.price_at_purchase, 
    p.title as product, 
    p.seller_id,
    t.status as tx_status
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
JOIN transactions t ON ti.transaction_id = t.id
ORDER BY ti.created_at DESC
LIMIT 10;
