-- Create function to get ALL seller sales with fresh data (no cache)
CREATE OR REPLACE FUNCTION get_all_seller_sales(seller_uuid UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    price_at_purchase NUMERIC,
    product_title TEXT,
    transaction_status TEXT,
    buyer_name TEXT,
    transaction_id UUID
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        ti.id,
        ti.created_at,
        ti.price_at_purchase,
        p.title AS product_title,
        t.status AS transaction_status,
        pr.full_name AS buyer_name,
        t.id AS transaction_id
    FROM transaction_items ti
    JOIN products p ON ti.product_id = p.id
    JOIN transactions t ON ti.transaction_id = t.id
    LEFT JOIN profiles pr ON t.buyer_id = pr.id
    WHERE p.seller_id = seller_uuid
      AND t.status IN ('settlement', 'capture')
    ORDER BY ti.created_at DESC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_all_seller_sales(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_seller_sales(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_all_seller_sales(UUID) TO service_role;
