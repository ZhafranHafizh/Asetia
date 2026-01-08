-- Allow public read access to products
create policy "Public products are viewable by everyone"
on products for select
using ( true );

-- Allow authenticated users to update products (for sold status)
create policy "Users can update products"
on products for update
using ( true );
