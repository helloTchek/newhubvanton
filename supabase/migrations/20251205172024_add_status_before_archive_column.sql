/*
  # Add status_before_archive column to vehicles table

  1. Changes
    - Add `status_before_archive` column to vehicles table to store the status before archiving
    - This allows restoring the previous status when unarchiving a vehicle
  
  2. Security
    - No RLS changes needed (inherits from vehicles table)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vehicles' AND column_name = 'status_before_archive'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN status_before_archive text;
  END IF;
END $$;