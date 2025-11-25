/*
  # Fix Vehicle Tags RLS Policies
  
  Add missing INSERT and DELETE policies for vehicle_tags table.
  
  These policies were supposed to be created by a previous migration but appear to be missing.
*/

-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Users can add tags to vehicles" ON vehicle_tags;
DROP POLICY IF EXISTS "Users can remove tags from vehicles" ON vehicle_tags;

-- Vehicle tags INSERT policy
CREATE POLICY "Users can add tags to vehicles"
  ON vehicle_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Vehicle tags DELETE policy  
CREATE POLICY "Users can remove tags from vehicles"
  ON vehicle_tags FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
