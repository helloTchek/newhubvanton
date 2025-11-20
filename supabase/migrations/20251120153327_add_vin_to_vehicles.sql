/*
  # Add VIN field to vehicles table

  1. Changes
    - Add `vin` column to `vehicles` table
      - Type: text
      - Nullable: true (not all vehicles may have VIN initially)
      - No default value

  2. Notes
    - VIN (Vehicle Identification Number) is a unique identifier for vehicles
    - This field can be populated gradually for existing vehicles
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vehicles' AND column_name = 'vin'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN vin text;
  END IF;
END $$;
