-- Add seller onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
ADD COLUMN IF NOT EXISTS store_name TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS store_bio TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected'));

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);

-- Update RLS policies to allow users to update their own seller information
CREATE POLICY "Users can update their own seller info"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
