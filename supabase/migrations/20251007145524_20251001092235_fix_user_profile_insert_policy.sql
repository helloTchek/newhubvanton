/*
  # Fix User Profile Insert Policy
  
  ## Problem
  The current INSERT policy for user_profiles is too restrictive during signup.
  New users need to create their profile after authentication but before a profile exists.
  
  ## Changes
  1. Drop the existing restrictive INSERT policy
  2. Create a new policy that allows authenticated users to insert their own profile
  3. Ensure the policy only allows inserting with their own auth.uid()
  
  ## Security
  - Users can ONLY insert a profile with their own ID (id = auth.uid())
  - No restrictions on role or company_id during signup
  - This allows first-time signup while maintaining security
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create a more permissive policy for initial profile creation
CREATE POLICY "New users can create their profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    -- Allow any role and company_id during initial signup
  );

-- Ensure admins can also insert profiles for other users
CREATE POLICY "Admins can insert any profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );