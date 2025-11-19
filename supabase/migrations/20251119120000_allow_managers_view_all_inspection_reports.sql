/*
  # Allow Managers to View All Inspection Reports

  1. Changes
    - Add policy for managers to view all inspection reports across all companies
    - This enables managers to see damage data for all vehicles in the system

  2. Security
    - Policy restricted to users with 'manager' role
    - Maintains RLS security by checking user role
*/

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Managers can view all reports" ON inspection_reports;

-- Allow managers to view all inspection reports
CREATE POLICY "Managers can view all reports"
  ON inspection_reports FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('manager', 'admin')
  );
