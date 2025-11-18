/*
  # Create Theme Configuration Schema

  1. New Tables
    - `theme_configurations`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `logo_url` (text) - URL to company logo
      - `logo_dark_url` (text, nullable) - URL to dark mode logo variant
      - `primary_color` (text) - Primary brand color (hex format)
      - `accent_color` (text) - Accent/secondary color (hex format)
      - `dominant_color` (text) - Dominant UI color (hex format)
      - `text_primary_color` (text) - Primary text color (hex format)
      - `background_primary_color` (text) - Primary background color (hex format)
      - `is_active` (boolean) - Whether this theme is currently active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `theme_configurations` table
    - Add policy for authenticated users to read theme configurations
    - Add policy for company admins to manage their theme configurations

  3. Indexes
    - Index on company_id for fast lookups
    - Index on is_active for active theme queries
*/

CREATE TABLE IF NOT EXISTS theme_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  logo_url text NOT NULL DEFAULT '',
  logo_dark_url text,
  primary_color text NOT NULL DEFAULT '#3B82F6',
  accent_color text NOT NULL DEFAULT '#10B981',
  dominant_color text NOT NULL DEFAULT '#1F2937',
  text_primary_color text NOT NULL DEFAULT '#111827',
  background_primary_color text NOT NULL DEFAULT '#FFFFFF',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_theme_configurations_company_id ON theme_configurations(company_id);
CREATE INDEX IF NOT EXISTS idx_theme_configurations_is_active ON theme_configurations(is_active);

ALTER TABLE theme_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read theme configurations"
  ON theme_configurations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Company admins can insert their theme configurations"
  ON theme_configurations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_company_id(auth.uid()) = company_id
    AND public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Company admins can update their theme configurations"
  ON theme_configurations
  FOR UPDATE
  TO authenticated
  USING (
    public.get_user_company_id(auth.uid()) = company_id
    AND public.get_user_role(auth.uid()) = 'admin'
  )
  WITH CHECK (
    public.get_user_company_id(auth.uid()) = company_id
    AND public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Company admins can delete their theme configurations"
  ON theme_configurations
  FOR DELETE
  TO authenticated
  USING (
    public.get_user_company_id(auth.uid()) = company_id
    AND public.get_user_role(auth.uid()) = 'admin'
  );

CREATE OR REPLACE FUNCTION update_theme_configuration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER theme_configuration_updated_at
  BEFORE UPDATE ON theme_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_configuration_updated_at();