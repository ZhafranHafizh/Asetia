-- Check who owns the products in transaction_items
SELECT 
    ti.id as item_id,
    ti.product_id,
    p.title as product_title,
    p.seller_id,
    prof.full_name as seller_name,
    t.buyer_id,
    buyer_prof.full_name as buyer_name
FROM transaction_items ti
LEFT JOIN products p ON ti.product_id = p.id
LEFT JOIN profiles prof ON p.seller_id = prof.id
LEFT JOIN transactions t ON ti.transaction_id = t.id
LEFT JOIN profiles buyer_prof ON t.buyer_id = buyer_prof.id
ORDER BY ti.created_at DESC
LIMIT 15;

-- Check your actual seller_id
SELECT id, full_name FROM profiles WHERE id = 'cee6b2b2-e851-4ffd-b106-ba296bed1a9f';

-- Check your products
SELECT id, title, seller_id FROM products WHERE seller_id = 'cee6b2b2-e851-4ffd-b106-ba296bed1a9f';
