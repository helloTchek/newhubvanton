/*
  # Allow Managers to View All Companies

  1. Changes
    - Update companies SELECT policies to allow managers to view all companies
    - Managers need to see all companies in the company selection screen
    - Maintain existing security for inspectors and viewers (single company only)

  2. Security
    - Admin role: Full access to all companies (unchanged)
    - Manager role: Can now view all companies
    - Inspector/Viewer roles: Restricted to their company only (unchanged)
*/

-- Drop existing company SELECT policies
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;

-- Recreate policies with manager access to all companies
CREATE POLICY "Admins and managers can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id = public.get_user_company_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('inspector', 'viewer')
  );