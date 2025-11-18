/*
  # Add Missing Fast Track and Related Columns

  1. New Columns
    - companies table:
      - `is_fast_track_disabled` (boolean) - Whether fast track is disabled for company
    - vehicles table:
      - `inspection_date` (timestamptz) - When vehicle was inspected
      - `customer_phone` (text) - Customer phone number
      - `inspection_type` (text) - Type of inspection (api, manual_upload, webapp)
      - `report_id` (uuid) - Reference to inspection report
      - `is_fast_track_disabled` (boolean) - Whether fast track is disabled for this vehicle
      - `manual_review_completed` (boolean) - Whether manual review has been completed

  2. Default Values
    - All boolean columns default to false
    - Nullable fields for optional data
*/

-- Add columns to companies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'is_fast_track_disabled'
  ) THEN
    ALTER TABLE companies ADD COLUMN is_fast_track_disabled boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add columns to vehicles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'inspection_date'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN inspection_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN customer_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'inspection_type'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN inspection_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'report_id'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN report_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'is_fast_track_disabled'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN is_fast_track_disabled boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'manual_review_completed'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN manual_review_completed boolean DEFAULT false NOT NULL;
  END IF;
END $$;