-- Fix seller_stats to count transaction_items instead of transactions
-- This ensures cart purchases (multiple items in one transaction) are counted correctly

DROP VIEW IF EXISTS "public"."seller_stats";

CREATE OR REPLACE VIEW "public"."seller_stats" AS
 SELECT 
    p.seller_id,
    -- Count transaction_items (not transactions) for accurate cart support
    COUNT(DISTINCT ti.id) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_sales,
    COALESCE(SUM(ti.price_at_purchase) FILTER (WHERE t.status IN ('settlement', 'capture')), 0) AS total_earnings,
    COUNT(DISTINCT p.id) AS active_products
   FROM products p
     LEFT JOIN transaction_items ti ON ti.product_id = p.id
     LEFT JOIN transactions t ON ti.transaction_id = t.id
  GROUP BY p.seller_id;

ALTER VIEW "public"."seller_stats" OWNER TO "postgres";

GRANT SELECT ON "public"."seller_stats" TO "authenticated";
GRANT SELECT ON "public"."seller_stats" TO "anon";
GRANT SELECT ON "public"."seller_stats" TO "service_role";
