/*
  # Allow Managers to View All Vehicles

  1. Changes
    - Update vehicles SELECT policies to allow managers to view all vehicles
    - Managers need access to all companies' vehicles when "All Companies" is selected
    - Maintain existing security for inspectors and viewers (company-restricted)

  2. Security
    - Admin role: Full access to all vehicles (unchanged)
    - Manager role: Can now view all vehicles across companies
    - Inspector/Viewer roles: Restricted to their company only (unchanged)
*/

-- Drop existing vehicle SELECT policies
DROP POLICY IF EXISTS "Admins can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can view company vehicles" ON vehicles;

-- Recreate policies with manager access to all vehicles
CREATE POLICY "Admins and managers can view all vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Users can view company vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    company_id = public.get_user_company_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('inspector', 'viewer')
  );