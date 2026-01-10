-- Comprehensive fix for transaction_items RLS and seller_stats view

-- 1. Ensure RLS is enabled
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop and recreate all policies to ensure clean state
DROP POLICY IF EXISTS "Buyers can view their own transaction items" ON public.transaction_items;
DROP POLICY IF EXISTS "Sellers can view transaction items for their products" ON public.transaction_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.transaction_items;

-- 3. Recreate policies
CREATE POLICY "Buyers can view their own transaction items"
    ON public.transaction_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.transactions
            WHERE transactions.id = transaction_items.transaction_id
            AND transactions.buyer_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can view transaction items for their products"
    ON public.transaction_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = transaction_items.product_id
            AND products.seller_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for authenticated users"
    ON public.transaction_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. Refresh seller_stats view (force recreation)
DROP VIEW IF EXISTS public.seller_stats CASCADE;

CREATE OR REPLACE VIEW public.seller_stats AS
SELECT 
    p.seller_id,
    COUNT(DISTINCT ti.id) FILTER (WHERE t.status IN ('settlement', 'capture')) AS total_sales,
    COALESCE(SUM(ti.price_at_purchase) FILTER (WHERE t.status IN ('settlement', 'capture')), 0) AS total_earnings,
    COUNT(DISTINCT p.id) AS active_products
FROM products p
LEFT JOIN transaction_items ti ON ti.product_id = p.id
LEFT JOIN transactions t ON ti.transaction_id = t.id
GROUP BY p.seller_id;

ALTER VIEW public.seller_stats OWNER TO postgres;

GRANT SELECT ON public.seller_stats TO authenticated;
GRANT SELECT ON public.seller_stats TO anon;
GRANT SELECT ON public.seller_stats TO service_role;
