-- Update storage policies for 'assets' bucket
-- Drop existing policies first to ideally start clean or override them

-- 1. Ensure 'previews' are PUBLIC READ
drop policy if exists "Public can view previews" on storage.objects;
create policy "Public can view previews"
  on storage.objects for select
  using ( bucket_id = 'assets' and (storage.foldername(name))[1] = 'previews' );

drop policy if exists "Seller can upload previews" on storage.objects;
create policy "Seller can upload previews"
  on storage.objects for insert
  with check ( bucket_id = 'assets' and (storage.foldername(name))[1] = 'previews' and auth.uid() = (storage.foldername(name))[2]::uuid );

-- 2. Ensure 'files' are PRIVATE (Remove any public read if exists)
-- DO NOT create a public select policy for 'files'
-- Only create a restricted policy for sellers to handle their own uploads/reads

drop policy if exists "Seller can upload product files" on storage.objects;
create policy "Seller can upload product files"
  on storage.objects for insert
  with check ( bucket_id = 'assets' and (storage.foldername(name))[1] = 'files' and auth.uid() = (storage.foldername(name))[2]::uuid );

drop policy if exists "Seller can read own product files" on storage.objects;
create policy "Seller can read own product files"
  on storage.objects for select
  using ( bucket_id = 'assets' and (storage.foldername(name))[1] = 'files' and auth.uid() = (storage.foldername(name))[2]::uuid );
