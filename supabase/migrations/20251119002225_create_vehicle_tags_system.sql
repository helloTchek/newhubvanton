/*
  # Create Vehicle Tags System

  1. New Tables
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Tag name
      - `color` (text) - Hex color for tag display
      - `created_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
    
    - `vehicle_tags`
      - `id` (uuid, primary key)
      - `vehicle_id` (uuid, references vehicles)
      - `tag_id` (uuid, references tags)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
      - Unique constraint on (vehicle_id, tag_id)

  2. Security
    - Enable RLS on both tables
    - Authenticated users can read all tags
    - Authenticated users can create tags
    - Authenticated users can add/remove tags to vehicles
*/

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create vehicle_tags junction table
CREATE TABLE IF NOT EXISTS vehicle_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(vehicle_id, tag_id)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_tags ENABLE ROW LEVEL SECURITY;

-- Tags policies
CREATE POLICY "Users can view all tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Vehicle tags policies
CREATE POLICY "Users can view all vehicle tags"
  ON vehicle_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add tags to vehicles"
  ON vehicle_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can remove tags from vehicles"
  ON vehicle_tags FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_tags_vehicle_id ON vehicle_tags(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tags_tag_id ON vehicle_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Insert some default tags
INSERT INTO tags (name, color, created_by) VALUES
  ('Priority', '#EF4444', (SELECT id FROM auth.users LIMIT 1)),
  ('Urgent', '#F59E0B', (SELECT id FROM auth.users LIMIT 1)),
  ('Follow-up', '#3B82F6', (SELECT id FROM auth.users LIMIT 1)),
  ('VIP', '#8B5CF6', (SELECT id FROM auth.users LIMIT 1)),
  ('Archived', '#6B7280', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (name) DO NOTHING;
