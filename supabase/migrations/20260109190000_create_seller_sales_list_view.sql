-- Create a specific view for listing sales to sellers
-- This bypasses RLS complexity on transactions table
CREATE OR REPLACE VIEW "public"."seller_sales_list_view" AS
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

ALTER VIEW "public"."seller_sales_list_view" OWNER TO "postgres";

-- Grant permissions
GRANT SELECT ON "public"."seller_sales_list_view" TO "authenticated";
GRANT SELECT ON "public"."seller_sales_list_view" TO "service_role";
