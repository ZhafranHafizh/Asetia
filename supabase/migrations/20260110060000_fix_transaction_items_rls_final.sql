-- Fix RLS on transaction_items - ensure sellers can view items for their products
-- This is the FINAL fix for the RLS blocking issue

-- First, check current state
DO $$ 
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
END $$;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Buyers can view their own transaction items" ON public.transaction_items;
DROP POLICY IF EXISTS "Sellers can view transaction items for their products" ON public.transaction_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.transaction_items;

-- Policy 1: Buyers can view their purchases
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

-- Policy 2: Sellers can view sales of their products
CREATE POLICY "Sellers can view their product sales"
    ON public.transaction_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = transaction_items.product_id
            AND products.seller_id = auth.uid()
        )
    );

-- Policy 3: Allow inserts during checkout
CREATE POLICY "Enable insert for authenticated users"
    ON public.transaction_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Verify policies were created
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'transaction_items';
    
    RAISE NOTICE 'Created % policies on transaction_items', policy_count;
END $$;
