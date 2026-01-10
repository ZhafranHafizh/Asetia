-- Allow sellers to view transactions that contain their products
-- This is needed for the Recent Sales feature

-- First, check existing policies
DO $$ 
BEGIN
    -- Drop existing seller view policy if it exists
    DROP POLICY IF EXISTS "Sellers can view transactions with their products" ON public.transactions;
END $$;

-- Create policy allowing sellers to see transactions containing their items
CREATE POLICY "Sellers can view transactions with their products"
    ON public.transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.transaction_items ti
            JOIN public.products p ON ti.product_id = p.id
            WHERE ti.transaction_id = transactions.id
            AND p.seller_id = auth.uid()
        )
    );
