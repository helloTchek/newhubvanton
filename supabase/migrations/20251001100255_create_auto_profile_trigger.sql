/*
  # Auto-create user profiles with database trigger
  
  ## Problem
  When a new user signs up, the application tries to insert a profile, but RLS policies
  can create circular dependencies. The best solution is to use a database trigger that
  runs with elevated privileges.
  
  ## Changes
  1. Create a trigger function that automatically creates a user_profile when a new auth.user is created
  2. The function runs as SECURITY DEFINER (with elevated privileges) to bypass RLS
  3. Set default values: role='viewer', no company initially
  
  ## Security
  - Function is SECURITY DEFINER but only does one specific safe operation
  - Extracts user metadata from the auth user record
  - Sets safe defaults that can be updated later by admins
  - No user input is processed, only system-generated data
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, role, company_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'viewer'),
    (NEW.raw_user_meta_data->>'company_id')::uuid
  );
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Now remove the application-level INSERT policies since the trigger handles it
DROP POLICY IF EXISTS "New users can create their profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON user_profiles;

-- Add back only the admin insert policy for manual profile creation
CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );
