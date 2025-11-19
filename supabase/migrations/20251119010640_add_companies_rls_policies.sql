/*
  # Add RLS Policies for Companies Table

  1. Security
    - Add SELECT policies for the companies table
    - Authenticated users can view all companies (needed for vehicle queries with joins)
    - This fixes the issue where vehicles weren't showing due to blocked company joins
  
  2. Changes
    - Create policy for authenticated users to view all companies
*/

-- Allow authenticated users to view all companies
-- This is necessary because the vehicles query joins with companies
-- and without this policy, the INNER JOIN returns no results
CREATE POLICY "Authenticated users can view companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);
