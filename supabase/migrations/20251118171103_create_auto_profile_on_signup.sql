/*
  # Auto-create User Profile on Signup

  ## Overview
  Creates a trigger function that automatically creates a user_profiles record
  when a new user signs up through Supabase Auth.

  ## Changes
  1. Create function to handle new user creation
  2. Create trigger on auth.users table
  3. Extracts user metadata and creates profile

  ## Security
  - Function runs with SECURITY DEFINER to bypass RLS
  - Only creates profile if it doesn't exist
  - Uses metadata from signup to populate fields
*/

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, role, company_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'viewer'),
    (new.raw_user_meta_data->>'company_id')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();