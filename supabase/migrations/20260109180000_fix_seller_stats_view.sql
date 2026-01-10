-- Drop old view
DROP VIEW IF EXISTS "public"."seller_stats";

-- Recreate view correctly joining transaction_items
-- Use security_invoker = true implicitly (default) or handle via RLS
CREATE OR REPLACE VIEW "public"."seller_stats" AS
 SELECT p.seller_id,
    count(DISTINCT t.id) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_sales,
    COALESCE(sum(ti.price_at_purchase) FILTER (WHERE t.status IN ('settlement', 'capture')), (0)::numeric) AS total_earnings,
    count(DISTINCT p.id) AS active_products
   FROM products p
     LEFT JOIN transaction_items ti ON ti.product_id = p.id
     LEFT JOIN transactions t ON ti.transaction_id = t.id
  GROUP BY p.seller_id;

ALTER VIEW "public"."seller_stats" OWNER TO "postgres";

-- Ensure permissions
GRANT SELECT ON "public"."seller_stats" TO "authenticated";
GRANT SELECT ON "public"."seller_stats" TO "anon";
GRANT SELECT ON "public"."seller_stats" TO "service_role";
