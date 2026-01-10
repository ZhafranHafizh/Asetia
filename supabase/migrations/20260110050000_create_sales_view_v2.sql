-- Create a new view with different name to force PostgREST to recognize it
-- This view will definitely be in schema cache after restart
DROP VIEW IF EXISTS seller_recent_sales_v2 CASCADE;

CREATE VIEW seller_recent_sales_v2 AS
SELECT 
    ti.id,
    ti.created_at,
    ti.price_at_purchase,
    p.title AS product_title,
    p.seller_id,
    t.status,
    pr.full_name AS buyer_name,
    t.id AS transaction_id
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
JOIN transactions t ON ti.transaction_id = t.id
LEFT JOIN profiles pr ON t.buyer_id = pr.id
WHERE t.status IN ('settlement', 'capture');

ALTER VIEW seller_recent_sales_v2 OWNER TO postgres;

GRANT SELECT ON seller_recent_sales_v2 TO authenticated;
GRANT SELECT ON seller_recent_sales_v2 TO anon;
GRANT SELECT ON seller_recent_sales_v2 TO service_role;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
