/*
  # Add RLS Policies for Damages Table

  1. Changes
    - Add SELECT policy for managers and admins to view all damages
    - Add SELECT policy for users to view damages for their company's vehicles
    - Add INSERT policy for inspectors to create damages
    - Add UPDATE policy for users to update damage status

  2. Security
    - All policies check authentication and appropriate authorization
    - Managers and admins have full access
    - Regular users can only see damages for their company's vehicles
*/

-- Allow managers and admins to view all damages
CREATE POLICY "Managers can view all damages"
  ON damages FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('manager', 'admin')
  );

-- Allow users to view damages for their company's vehicles
CREATE POLICY "Users can view company damages"
  ON damages FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
  );

-- Allow inspectors to insert damages
CREATE POLICY "Inspectors can insert damages"
  ON damages FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('inspector', 'manager', 'admin')
    AND report_id IN (
      SELECT ir.id FROM inspection_reports ir
      JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
  );

-- Allow users to update damages for their company's vehicles
CREATE POLICY "Users can update company damages"
  ON damages FOR UPDATE
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
  )
  WITH CHECK (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
  );
