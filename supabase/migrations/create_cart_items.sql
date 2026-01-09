-- Create cart_items table
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure a user can't add the same product twice
  unique(user_id, product_id)
);

-- Enable RLS
alter table public.cart_items enable row level security;

-- RLS Policies
create policy "Users can view their own cart items"
  on cart_items for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own cart items"
  on cart_items for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own cart items"
  on cart_items for delete
  using ( auth.uid() = user_id );

-- Index for faster queries
create index cart_items_user_id_idx on cart_items(user_id);
create index cart_items_product_id_idx on cart_items(product_id);
