/*
  # Add Fast Track and Manual Review Fields

  1. Changes to Tables
    - Add `is_fast_track_disabled` to `companies` table
      - Boolean field to control whether damage review is mandatory
      - Defaults to false (fast track enabled)
    
    - Add `manual_review_completed` to `inspection_reports` table
      - Boolean field to track if manual damage review was performed
      - Defaults to false
    
    - Add `manual_review_completed_at` to `inspection_reports` table
      - Timestamp for when manual review was completed
      - Nullable
    
    - Add `manual_review_completed_by` to `inspection_reports` table
      - Reference to user who completed the manual review
      - Nullable

  2. Status Logic
    - If fast track disabled (true) and no manual review: status = "inspected" but shows "Review Pending"
    - If fast track enabled (false) and no manual review: status = "to_review"
    - If fast track enabled (false) and manual review done: status = "inspected" with "Manual Review Completed" indicator
*/

-- Add is_fast_track_disabled to companies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'is_fast_track_disabled'
  ) THEN
    ALTER TABLE companies ADD COLUMN is_fast_track_disabled boolean DEFAULT false;
  END IF;
END $$;

-- Add manual review fields to inspection_reports table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_reports' AND column_name = 'manual_review_completed'
  ) THEN
    ALTER TABLE inspection_reports ADD COLUMN manual_review_completed boolean DEFAULT false;
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
    ALTER TABLE inspection_reports ADD COLUMN manual_review_completed_by uuid REFERENCES user_profiles(id);
  END IF;
END $$;

-- Update existing data: set manual_review_completed to true for reports that have reviewed damages
UPDATE inspection_reports
SET manual_review_completed = true,
    manual_review_completed_at = updated_at
WHERE id IN (
  SELECT DISTINCT report_id
  FROM damages
  WHERE status IN ('validated', 'non_billable', 'false_positive')
  AND reviewed_by IS NOT NULL
);
