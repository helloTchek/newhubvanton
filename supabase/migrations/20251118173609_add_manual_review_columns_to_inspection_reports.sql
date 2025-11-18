/*
  # Add Manual Review Columns to Inspection Reports

  1. New Columns
    - inspection_reports table:
      - `manual_review_completed` (boolean) - Whether manual review has been completed
      - `manual_review_completed_at` (timestamptz) - When manual review was completed
      - `manual_review_completed_by` (uuid) - Who completed the manual review

  2. Default Values
    - manual_review_completed defaults to false
    - Other columns are nullable
*/

-- Add manual review columns to inspection_reports table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_reports' AND column_name = 'manual_review_completed'
  ) THEN
    ALTER TABLE inspection_reports ADD COLUMN manual_review_completed boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_reports' AND column_name = 'manual_review_completed_at'
  ) THEN
    ALTER TABLE inspection_reports ADD COLUMN manual_review_completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_reports' AND column_name = 'manual_review_completed_by'
  ) THEN
    ALTER TABLE inspection_reports ADD COLUMN manual_review_completed_by uuid REFERENCES auth.users(id);
  END IF;
END $$;