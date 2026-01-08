-- Enable RLS
alter table auth.users enable row level security;

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  role text check (role in ('user', 'admin')) default 'user',
  balance numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Handle new user signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- PRODUCTS
create table public.products (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  price numeric not null,
  category text,
  sale_type text check (sale_type in ('unlimited', 'one_time')) default 'unlimited',
  sold_to uuid references public.profiles(id),
  sold_at timestamp with time zone,
  file_path text not null, -- Path to the actual ZIP file in 'assets' bucket
  preview_url text, -- URL for the thumbnail/image
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

create policy "Products are viewable by everyone."
  on products for select
  using ( true );

create policy "Sellers can insert their own products."
  on products for insert
  with check ( auth.uid() = seller_id );

-- TRANSACTIONS
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id) not null,
  amount numeric not null,
  status text check (status in ('pending', 'settlement', 'expire', 'cancel')) default 'pending',
  midtrans_order_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions."
  on transactions for select
  using ( auth.uid() = buyer_id );

create policy "Users can insert their own transactions."
  on transactions for insert
  with check ( auth.uid() = buyer_id );

-- STORAGE BUCKETS
-- STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = true;

-- Storage Policies for 'assets' bucket
-- Folder 'files/': Private, only seller upload/read
create policy "Seller can upload product files"
  on storage.objects for insert
  with check ( bucket_id = 'assets' and (storage.foldername(name))[1] = 'files' and auth.uid() = (storage.foldername(name))[2]::uuid );

create policy "Seller can read own product files"
  on storage.objects for select
  using ( bucket_id = 'assets' and (storage.foldername(name))[1] = 'files' and auth.uid() = (storage.foldername(name))[2]::uuid );

-- Folder 'previews/': Public read, Seller upload
create policy "Public can view previews"
  on storage.objects for select
  using ( bucket_id = 'assets' and (storage.foldername(name))[1] = 'previews' );

create policy "Seller can upload previews"
  on storage.objects for insert
  with check ( bucket_id = 'assets' and (storage.foldername(name))[1] = 'previews' and auth.uid() = (storage.foldername(name))[2]::uuid );

