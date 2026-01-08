-- Create a view for efficient seller statistics aggregation
CREATE OR REPLACE VIEW seller_stats AS
SELECT 
    p.seller_id,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'settlement') as total_sales,
    COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'settlement'), 0) as total_earnings,
    COUNT(DISTINCT p.id) as active_products
FROM products p
LEFT JOIN transactions t ON t.product_id = p.id
GROUP BY p.seller_id;

-- Grant access to authenticated users
GRANT SELECT ON seller_stats TO authenticated;
