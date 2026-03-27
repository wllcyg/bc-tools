-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles." ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Ensure admins can view all profiles (optional as it's already public, but good for clarity)
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
-- CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
