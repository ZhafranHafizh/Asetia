-- Add store_logo column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_logo TEXT;

-- Create index for logo lookup
CREATE INDEX IF NOT EXISTS idx_profiles_store_logo ON public.profiles(store_logo) WHERE store_logo IS NOT NULL;
