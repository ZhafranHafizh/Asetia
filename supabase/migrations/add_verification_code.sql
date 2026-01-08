-- Add email verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_code TEXT,
ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for code lookup
CREATE INDEX IF NOT EXISTS idx_profiles_verification_code ON public.profiles(verification_code) WHERE verification_code IS NOT NULL;
