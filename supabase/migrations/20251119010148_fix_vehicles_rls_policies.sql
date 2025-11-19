/*
  # Fix Vehicle RLS Policies

  1. Security
    - Add RLS policies for vehicles table to allow proper access
    - Managers can view vehicles from their own company
    - Admins can view all vehicles
    - Authenticated users can select vehicles based on their role
  
  2. Changes
    - Create policy for managers to view their company's vehicles
    - Create policy for admins to view all vehicles
*/

-- Drop any existing policies (just in case)
DROP POLICY IF EXISTS "Managers can view company vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can view all vehicles" ON vehicles;

-- Allow managers to view vehicles from their company
CREATE POLICY "Managers can view company vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND company_id IS NOT NULL
    )
  );

-- Allow admins to view all vehicles
CREATE POLICY "Admins can view all vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
