/*
  # Fix Infinite Recursion in User Profiles RLS Policies

  ## Problem
  The "Admins can view all profiles" policy causes infinite recursion because it queries
  the same table (user_profiles) it's protecting, creating a circular dependency.

  ## Solution
  1. Drop the problematic recursive policy
  2. Keep only the non-recursive policies:
     - Users can view their own profile (id = auth.uid())
     - Company members can view each other (through company_id)
  
  ## Impact
  - Admins will still be able to view all profiles through the company membership policy
  - Removes the infinite recursion error
  - Maintains proper security isolation
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Also fix other policies that reference user_profiles recursively for admin checks
-- These are in the companies table
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

-- Recreate companies policies without recursion
-- Simple approach: users can view/manage companies they belong to
CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
      AND company_id IS NOT NULL
    )
  );

-- For now, we'll use a function-based approach for admin checks
-- Create a function that checks if current user is admin using auth.jwt()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'admin' FROM user_profiles WHERE id = auth.uid()),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Now create admin policies using the function (this breaks recursion)
CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add back admin policy for user_profiles using the function
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Fix admin policies for other tables that have recursion
-- Vehicles table
DROP POLICY IF EXISTS "Admins can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can delete vehicles" ON vehicles;

CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (is_admin());

-- Inspection reports table
DROP POLICY IF EXISTS "Admins can view all reports" ON inspection_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON inspection_reports;

CREATE POLICY "Admins can view all reports"
  ON inspection_reports FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete reports"
  ON inspection_reports FOR DELETE
  TO authenticated
  USING (is_admin());

-- Inspection sections table
DROP POLICY IF EXISTS "Admins can insert sections" ON inspection_sections;
DROP POLICY IF EXISTS "Admins can update sections" ON inspection_sections;
DROP POLICY IF EXISTS "Admins can delete sections" ON inspection_sections;

CREATE POLICY "Admins can insert sections"
  ON inspection_sections FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update sections"
  ON inspection_sections FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete sections"
  ON inspection_sections FOR DELETE
  TO authenticated
  USING (is_admin());

-- Fix user_profiles update policies
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());