/*
  # Create Internal Events Schema

  1. New Tables
    - `internal_events`
      - `id` (uuid, primary key)
      - `event_type` (text) - Type of event (e.g., 'report_shared', 'status_changed')
      - `report_id` (uuid, foreign key to inspection_reports)
      - `vehicle_id` (uuid, foreign key to vehicles)
      - `user_id` (uuid, foreign key to user_profiles)
      - `event_data` (jsonb) - Flexible data storage for event-specific information
      - `created_at` (timestamptz)

  2. Indexes
    - Index on event_type for filtering by event type
    - Index on report_id for report history
    - Index on vehicle_id for vehicle history
    - Index on user_id for user activity tracking
    - Index on created_at for chronological sorting

  3. Security
    - Enable RLS on internal_events table
    - Users can view events for their company's vehicles
    - Users can create events for their company's vehicles
    - Managers and admins can view all events

  4. Notes
    - Provides audit trail for internal actions
    - Enables tracking of report sharing without email delivery
    - Can be extended for other event types (status changes, damage updates, etc.)
*/

-- Create internal_events table
CREATE TABLE IF NOT EXISTS internal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  report_id uuid REFERENCES inspection_reports(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_internal_events_event_type ON internal_events(event_type);
CREATE INDEX IF NOT EXISTS idx_internal_events_report_id ON internal_events(report_id);
CREATE INDEX IF NOT EXISTS idx_internal_events_vehicle_id ON internal_events(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_internal_events_user_id ON internal_events(user_id);
CREATE INDEX IF NOT EXISTS idx_internal_events_created_at ON internal_events(created_at DESC);

-- Enable RLS
ALTER TABLE internal_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view events for their company vehicles
CREATE POLICY "Users can view events for their company"
  ON internal_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE v.id = internal_events.vehicle_id
      AND up.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin')
    )
  );

-- Policy: Users can create events for their company vehicles
CREATE POLICY "Users can create events for their company"
  ON internal_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM vehicles v
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE v.id = internal_events.vehicle_id
      AND up.id = auth.uid()
    )
  );
