/*
  # Add images array to vehicles table

  1. Changes
    - Add `images` column to `vehicles` table as a text array
    - This allows storing multiple image URLs for each vehicle
    - The existing `image_url` column remains for backward compatibility
  
  2. Notes
    - Images array is optional and can be null
    - When images array is provided, it takes precedence over single image_url
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'images'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN images text[];
  END IF;
END $$;
