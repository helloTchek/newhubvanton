/*
  # Add Manual Review Type

  1. Changes
    - Add `manual_review_type` column to track who performed the manual review
      - Values: 'customer', 'tchek', null (when not reviewed)
    - Update existing data to set review type for completed reviews
*/

-- Add manual review type field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_reports' AND column_name = 'manual_review_type'
  ) THEN
    ALTER TABLE inspection_reports 
    ADD COLUMN manual_review_type text CHECK (manual_review_type IN ('customer', 'tchek'));
  END IF;
END $$;

-- Set existing manual reviews to 'customer' type by default
UPDATE inspection_reports 
SET manual_review_type = 'customer'
WHERE manual_review_completed = true AND manual_review_type IS NULL;
