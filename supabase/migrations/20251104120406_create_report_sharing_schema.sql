/*
  # Report Sharing Feature Schema

  1. New Tables
    - `shared_reports`
      - `id` (uuid, primary key)
      - `report_id` (uuid, foreign key to inspection_reports)
      - `vehicle_id` (uuid, foreign key to vehicles)
      - `shared_by` (uuid, foreign key to user_profiles)
      - `shared_to` (text array, email addresses)
      - `shared_at` (timestamptz)
      - `message` (text, optional message)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Index on report_id for fast lookups
    - Index on vehicle_id for filtering
    - Index on shared_by for user tracking
    - Index on shared_at for chronological sorting

  3. Security
    - Enable RLS on shared_reports table
    - Authenticated users can view shared reports for their company
    - Only authenticated users can share reports
    - Admins can view all shared reports

  4. Notes
    - Allows tracking of when reports are shared
    - Stores list of recipients for audit trail
    - Enables filtering by shared status
    - Provides data for history/timeline display
*/

-- Create shared_reports table
CREATE TABLE IF NOT EXISTS shared_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES inspection_reports(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  shared_to text[] NOT NULL DEFAULT '{}',
  message text,
  shared_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_reports_report_id ON shared_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_vehicle_id ON shared_reports(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_shared_by ON shared_reports(shared_by);
CREATE INDEX IF NOT EXISTS idx_shared_reports_shared_at ON shared_reports(shared_at DESC);

-- Enable RLS
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shared reports for their company vehicles
CREATE POLICY "Users can view shared reports for their company"
  ON shared_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE v.id = shared_reports.vehicle_id
      AND up.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Authenticated users can create shared report records
CREATE POLICY "Users can share reports"
  ON shared_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shared_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM vehicles v
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE v.id = shared_reports.vehicle_id
      AND up.id = auth.uid()
    )
  );

-- Policy: Users can update their own shared reports
CREATE POLICY "Users can update own shared reports"
  ON shared_reports
  FOR UPDATE
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shared_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_shared_reports_updated_at ON shared_reports;
CREATE TRIGGER set_shared_reports_updated_at
  BEFORE UPDATE ON shared_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_reports_updated_at();
