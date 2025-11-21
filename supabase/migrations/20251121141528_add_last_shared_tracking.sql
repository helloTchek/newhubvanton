/*
  # Add Last Shared Tracking to Inspection Reports

  1. Changes
    - Add `last_shared_at` column to `inspection_reports` table to track when report was last shared
    - This allows us to compare with `updated_at` to determine if changes have been made since last share

  2. Business Logic
    - When `last_shared_at` is NULL: Report has never been shared
    - When `last_shared_at` < `updated_at`: Report has been modified since last share (needs re-sharing)
    - When `last_shared_at` >= `updated_at`: Report is up-to-date with last share

  3. Notes
    - Column is nullable to indicate reports that have never been shared
    - Will be updated by application when "Share Updated Report" action is performed
*/

-- Add last_shared_at column to inspection_reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_reports' AND column_name = 'last_shared_at'
  ) THEN
    ALTER TABLE inspection_reports ADD COLUMN last_shared_at timestamptz;
  END IF;
END $$;

-- Create index for filtering by share status
CREATE INDEX IF NOT EXISTS idx_inspection_reports_last_shared_at ON inspection_reports(last_shared_at);
