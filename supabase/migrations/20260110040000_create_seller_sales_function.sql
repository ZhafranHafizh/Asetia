-- Create a function to get seller sales (alternative to view for schema cache issues)
CREATE OR REPLACE FUNCTION get_seller_recent_sales(seller_uuid UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    price_at_purchase NUMERIC,
    product_title TEXT,
    seller_id UUID,
    status TEXT,
    buyer_name TEXT,
    transaction_id UUID
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
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
    WHERE p.seller_id = seller_uuid
      AND t.status IN ('settlement', 'capture')
    ORDER BY ti.created_at DESC
    LIMIT 10;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_seller_recent_sales(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_seller_recent_sales(UUID) TO service_role;
