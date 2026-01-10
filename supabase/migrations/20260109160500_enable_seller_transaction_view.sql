-- Enable sellers to view transactions that contain their products
CREATE POLICY "Sellers can view transactions containing their products"
    ON public.transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.transaction_items
            JOIN public.products ON products.id = transaction_items.product_id
            WHERE transaction_items.transaction_id = transactions.id
            AND products.seller_id = auth.uid()
        )
    );
