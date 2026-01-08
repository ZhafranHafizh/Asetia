-- Add sale_type and sold_to columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sale_type text CHECK (sale_type IN ('unlimited', 'one_time')) DEFAULT 'unlimited',
ADD COLUMN IF NOT EXISTS sold_to uuid REFERENCES profiles(id);

-- Update existing products to have default sale_type
UPDATE products 
SET sale_type = 'unlimited' 
WHERE sale_type IS NULL;
