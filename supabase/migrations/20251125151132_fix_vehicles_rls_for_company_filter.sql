/*
  # Fix Vehicles RLS Policies for Company Filtering

  ## Problem
  Previous migration (20251119010148) incorrectly restricted vehicles access
  to only the user's own company, breaking the ability for managers and admins
  to filter by different companies.

  ## Changes
  1. Drop the restrictive policies that were incorrectly applied
  2. Restore the correct policies that allow:
     - Admins and managers: View ALL vehicles across all companies
     - Inspectors and viewers: View only their company's vehicles

  ## Security
  - Maintains proper role-based access control
  - Uses helper functions to avoid RLS recursion
  - Admins/managers can filter and view any company
  - Inspectors/viewers remain restricted to their company
*/

-- Drop the incorrectly restrictive policies
DROP POLICY IF EXISTS "Managers can view company vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins and managers can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can view company vehicles" ON vehicles;

-- Create correct policies: Admins and managers can view ALL vehicles
CREATE POLICY "Admins and managers can view all vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- Inspectors and viewers can only view their company's vehicles
CREATE POLICY "Users can view company vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    company_id = public.get_user_company_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('inspector', 'viewer')
  );
