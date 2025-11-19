/*
  # Create User Preferences Table

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `view_mode` (text) - 'grid' or 'list'
      - `filters` (jsonb) - stores filter state
      - `sort_by` (text) - current sort field
      - `sort_order` (text) - 'asc' or 'desc'
      - `column_order` (jsonb) - array of column IDs
      - `visible_columns` (jsonb) - object with column visibility
      - `visible_card_fields` (jsonb) - object with card field visibility
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for users to manage their own preferences
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  view_mode text DEFAULT 'grid' CHECK (view_mode IN ('grid', 'list')),
  filters jsonb DEFAULT '{}'::jsonb,
  sort_by text,
  sort_order text DEFAULT 'desc' CHECK (sort_order IN ('asc', 'desc')),
  column_order jsonb DEFAULT '["vehicle", "company", "status", "inspectionDate", "inspectionId", "mileage", "value", "tags", "carBody", "rim", "glass", "interior", "tires", "dashboard", "declarations"]'::jsonb,
  visible_columns jsonb DEFAULT '{"vehicle": true, "company": true, "status": true, "inspectionDate": true, "inspectionId": true, "mileage": true, "value": true, "tags": true, "carBody": true, "rim": true, "glass": true, "interior": true, "tires": true, "dashboard": true, "declarations": true}'::jsonb,
  visible_card_fields jsonb DEFAULT '{"image": true, "status": true, "inspectionDate": true, "registration": true, "company": true, "mileage": true, "value": true, "damageResults": true, "tags": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();