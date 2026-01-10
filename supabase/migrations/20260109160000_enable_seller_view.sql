-- Enable sellers to view transaction items for their products
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
