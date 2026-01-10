-- Drop previous policies to avoid conflicts
DROP POLICY IF EXISTS "Sellers can view transaction items for their products" ON public.transaction_items;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.transaction_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.transaction_items;

-- Re-create basic policies for transaction_items

-- 1. Buyers can view their own transaction items (via transaction buyer_id)
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

-- 2. Sellers can view transaction items for their OWN products
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

-- 3. Allow INSERT during checkout (Authenticated users)
CREATE POLICY "Enable insert for authenticated users"
    ON public.transaction_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
