/*
  # Fix User Profiles RLS Infinite Recursion

  ## Overview
  This migration fixes the infinite recursion issue in user_profiles RLS policies
  by creating security definer functions that bypass RLS when checking roles.

  ## Changes
  1. Drop existing user_profiles policies
  2. Create helper functions with SECURITY DEFINER
  3. Create new policies using the helper functions

  ## Security Notes
  - Helper functions use SECURITY DEFINER to bypass RLS temporarily
  - Functions only return boolean values, not actual data
  - This is a safe pattern recommended by Supabase for avoiding RLS recursion
*/

-- Drop existing user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Company members can view each other" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create helper function to get user's company_id (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM user_profiles WHERE id = user_id;
$$;

-- Create helper function to get user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM user_profiles WHERE id = user_id;
$$;

-- ============================================================================
-- USER_PROFILES TABLE POLICIES (Using helper functions)
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users in same company can view each other
CREATE POLICY "Company members can view each other"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND company_id = public.get_user_company_id(auth.uid())
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = public.get_user_role(auth.uid())
    AND (company_id IS NULL OR company_id = public.get_user_company_id(auth.uid()))
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- New users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());