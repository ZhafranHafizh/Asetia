SELECT 
  t.id as tx_id, 
  t.status, 
  t.created_at,
  ti.id as item_id, 
  ti.price_at_purchase,
  p.title,
  p.seller_id
FROM transactions t
JOIN transaction_items ti ON t.id = ti.transaction_id
JOIN products p ON ti.product_id = p.id
ORDER BY t.created_at DESC
LIMIT 10;
