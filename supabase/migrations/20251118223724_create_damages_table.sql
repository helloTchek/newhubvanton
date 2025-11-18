/*
  # Create Damages Table

  1. New Tables
    - `damages` table:
      - `id` (uuid, primary key)
      - `report_id` (uuid, foreign key to inspection_reports)
      - `section_id` (text) - The section where damage was found
      - `part_name` (text) - Name of the damaged part
      - `location` (text) - Location of the damage
      - `damage_type` (text) - Type of damage (scratch, dent, crack, etc.)
      - `severity` (integer) - Severity level (1-5)
      - `status` (text) - Status of the damage (pending, confirmed, false_positive, etc.)
      - `confidence_score` (numeric) - AI confidence score
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `damages` table
    - Add policy for authenticated users to read damages
    - Add policy for inspectors to create/update damages
*/

CREATE TABLE IF NOT EXISTS damages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES inspection_reports(id) ON DELETE CASCADE,
  section_id text NOT NULL,
  part_name text NOT NULL,
  location text,
  damage_type text,
  severity integer CHECK (severity >= 1 AND severity <= 5),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'false_positive')),
  confidence_score numeric DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE damages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read damages for their company's vehicles
CREATE POLICY "Users can view damages for their company vehicles"
  ON damages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspection_reports ir
      JOIN vehicles v ON v.id = ir.vehicle_id
      JOIN user_profiles up ON up.company_id = v.company_id
      WHERE ir.id = damages.report_id
      AND up.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Allow inspectors and admins to create damages
CREATE POLICY "Inspectors can create damages"
  ON damages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'inspector')
    )
  );

-- Allow inspectors and admins to update damages
CREATE POLICY "Inspectors can update damages"
  ON damages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'inspector', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'inspector', 'manager')
    )
  );