/*
  # Create Damage Review Schema

  ## New Tables
  
  1. `damage_images`
    - `id` (uuid, primary key)
    - `report_id` (uuid, foreign key to inspection_reports)
    - `section_id` (text)
    - `part_name` (text)
    - `image_url` (text)
    - `image_type` (text) - 'damage', 'vin', 'mileage', 'general'
    - `order_index` (integer)
    - `metadata` (jsonb) - for storing additional image info
    - `created_at` (timestamptz)
    
  2. `damages`
    - `id` (uuid, primary key)
    - `report_id` (uuid, foreign key to inspection_reports)
    - `image_id` (uuid, foreign key to damage_images)
    - `damage_group_id` (uuid) - links same damage across multiple images
    - `section_id` (text)
    - `part_name` (text)
    - `location` (text)
    - `damage_type` (text)
    - `severity` (integer) - 0 to 5
    - `status` (text) - 'pending', 'validated', 'non_billable', 'false_positive'
    - `bounding_box` (jsonb) - {x, y, width, height}
    - `confidence_score` (decimal)
    - `reviewed_by` (uuid, foreign key to user_profiles)
    - `reviewed_at` (timestamptz)
    - `notes` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
  3. `damage_review_sessions`
    - `id` (uuid, primary key)
    - `report_id` (uuid, foreign key to inspection_reports)
    - `reviewer_id` (uuid, foreign key to user_profiles)
    - `section_id` (text)
    - `section_status` (text) - 'not_started', 'in_progress', 'completed'
    - `started_at` (timestamptz)
    - `completed_at` (timestamptz)
    - `comments` (text)
    
  4. `vehicle_metadata`
    - `id` (uuid, primary key)
    - `vehicle_id` (uuid, foreign key to vehicles)
    - `report_id` (uuid, foreign key to inspection_reports)
    - `vin` (text)
    - `vin_image_id` (uuid, foreign key to damage_images)
    - `mileage` (integer)
    - `mileage_image_id` (uuid, foreign key to damage_images)
    - `brand` (text)
    - `model` (text)
    - `category` (text)
    - `year` (integer)
    - `metadata` (jsonb)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access their company's data
*/

-- Create damage_images table
CREATE TABLE IF NOT EXISTS damage_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES inspection_reports(id) ON DELETE CASCADE,
  section_id text NOT NULL DEFAULT '',
  part_name text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  image_type text NOT NULL DEFAULT 'damage',
  order_index integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create damages table
CREATE TABLE IF NOT EXISTS damages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES inspection_reports(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES damage_images(id) ON DELETE CASCADE,
  damage_group_id uuid DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  part_name text NOT NULL,
  location text NOT NULL DEFAULT '',
  damage_type text NOT NULL,
  severity integer NOT NULL DEFAULT 0 CHECK (severity >= 0 AND severity <= 5),
  status text NOT NULL DEFAULT 'pending',
  bounding_box jsonb NOT NULL DEFAULT '{}',
  confidence_score decimal(3,2) DEFAULT 0.0,
  reviewed_by uuid REFERENCES user_profiles(id),
  reviewed_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create damage_review_sessions table
CREATE TABLE IF NOT EXISTS damage_review_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES inspection_reports(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES user_profiles(id),
  section_id text NOT NULL,
  section_status text NOT NULL DEFAULT 'not_started',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  comments text DEFAULT ''
);

-- Create vehicle_metadata table
CREATE TABLE IF NOT EXISTS vehicle_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  report_id uuid REFERENCES inspection_reports(id) ON DELETE CASCADE,
  vin text DEFAULT '',
  vin_image_id uuid REFERENCES damage_images(id),
  mileage integer DEFAULT 0,
  mileage_image_id uuid REFERENCES damage_images(id),
  brand text DEFAULT '',
  model text DEFAULT '',
  category text DEFAULT '',
  year integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_damage_images_report_id ON damage_images(report_id);
CREATE INDEX IF NOT EXISTS idx_damage_images_section_id ON damage_images(section_id);
CREATE INDEX IF NOT EXISTS idx_damages_report_id ON damages(report_id);
CREATE INDEX IF NOT EXISTS idx_damages_image_id ON damages(image_id);
CREATE INDEX IF NOT EXISTS idx_damages_damage_group_id ON damages(damage_group_id);
CREATE INDEX IF NOT EXISTS idx_damages_section_id ON damages(section_id);
CREATE INDEX IF NOT EXISTS idx_damages_status ON damages(status);
CREATE INDEX IF NOT EXISTS idx_damage_review_sessions_report_id ON damage_review_sessions(report_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_metadata_vehicle_id ON vehicle_metadata(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_metadata_report_id ON vehicle_metadata(report_id);

-- Enable RLS
ALTER TABLE damage_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE damages ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for damage_images
CREATE POLICY "Users can view damage images for their company reports"
  ON damage_images FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      WHERE ir.vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE company_id = current_user_company_id()
      )
    )
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Users can manage damage images for their company reports"
  ON damage_images FOR ALL
  TO authenticated
  USING (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
      OR
      current_user_role() = 'admin'
    )
  )
  WITH CHECK (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
      OR
      current_user_role() = 'admin'
    )
  );

-- RLS Policies for damages
CREATE POLICY "Users can view damages for their company reports"
  ON damages FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      WHERE ir.vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE company_id = current_user_company_id()
      )
    )
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Users can manage damages for their company reports"
  ON damages FOR ALL
  TO authenticated
  USING (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
      OR
      current_user_role() = 'admin'
    )
  )
  WITH CHECK (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
      OR
      current_user_role() = 'admin'
    )
  );

-- RLS Policies for damage_review_sessions
CREATE POLICY "Users can view review sessions for their company reports"
  ON damage_review_sessions FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      WHERE ir.vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE company_id = current_user_company_id()
      )
    )
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Users can manage review sessions for their company reports"
  ON damage_review_sessions FOR ALL
  TO authenticated
  USING (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
      OR
      current_user_role() = 'admin'
    )
  )
  WITH CHECK (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
      OR
      current_user_role() = 'admin'
    )
  );

-- RLS Policies for vehicle_metadata
CREATE POLICY "Users can view vehicle metadata for their company"
  ON vehicle_metadata FOR SELECT
  TO authenticated
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles 
      WHERE company_id = current_user_company_id()
    )
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Users can manage vehicle metadata for their company"
  ON vehicle_metadata FOR ALL
  TO authenticated
  USING (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE company_id = current_user_company_id()
      )
      OR
      current_user_role() = 'admin'
    )
  )
  WITH CHECK (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE company_id = current_user_company_id()
      )
      OR
      current_user_role() = 'admin'
    )
  );