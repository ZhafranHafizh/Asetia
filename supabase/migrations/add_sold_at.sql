-- Add sold_at timestamp column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sold_at timestamp with time zone;

-- Add comment
COMMENT ON COLUMN products.sold_at IS 'Timestamp when the product was sold (for one-time sales)';
