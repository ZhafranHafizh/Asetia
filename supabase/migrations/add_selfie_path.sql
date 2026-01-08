-- Add selfie_path column to profiles table for identity verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selfie_path TEXT;

-- Add index for verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_selfie_path ON public.profiles(selfie_path) WHERE selfie_path IS NOT NULL;
