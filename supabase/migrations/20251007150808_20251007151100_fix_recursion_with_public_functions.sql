/*
  # Fix User Profiles Recursion - Use Public Schema Functions

  ## Problem
  Policies on user_profiles that reference user_profiles create infinite recursion.

  ## Solution
  Create SECURITY DEFINER functions in public schema that bypass RLS to get user info.

  ## Security
  - Functions are SECURITY DEFINER but only do safe, specific operations
  - Functions are STABLE (cached within transaction) for performance
*/

-- Create helper functions that bypass RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS uuid AS $$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- DROP AND RECREATE USER_PROFILES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view company members" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view company members"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND company_id = current_user_company_id()
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Service role can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- UPDATE OTHER POLICIES TO USE THE HELPER FUNCTIONS
-- ============================================================================

-- COMPANIES
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;

CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id = current_user_company_id()
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Admins can manage companies"
  ON companies FOR ALL
  TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- VEHICLES
DROP POLICY IF EXISTS "Users can view vehicles" ON vehicles;
DROP POLICY IF EXISTS "Authorized users can insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Authorized users can update vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can delete vehicles" ON vehicles;

CREATE POLICY "Users can view vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    company_id = current_user_company_id()
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Authorized users can insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      company_id = current_user_company_id()
      OR
      current_user_role() = 'admin'
    )
  );

CREATE POLICY "Authorized users can update vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      company_id = current_user_company_id()
      OR
      current_user_role() = 'admin'
    )
  )
  WITH CHECK (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND (
      company_id = current_user_company_id()
      OR
      current_user_role() = 'admin'
    )
  );

CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (current_user_role() = 'admin');

-- INSPECTION_REPORTS
DROP POLICY IF EXISTS "Users can view reports" ON inspection_reports;
DROP POLICY IF EXISTS "Inspectors can insert reports" ON inspection_reports;
DROP POLICY IF EXISTS "Users can update reports" ON inspection_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON inspection_reports;

CREATE POLICY "Users can view reports"
  ON inspection_reports FOR SELECT
  TO authenticated
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles 
      WHERE company_id = current_user_company_id()
    )
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Inspectors can insert reports"
  ON inspection_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    current_user_role() IN ('inspector', 'manager', 'admin')
    AND inspector_id = auth.uid()
  );

CREATE POLICY "Users can update reports"
  ON inspection_reports FOR UPDATE
  TO authenticated
  USING (
    inspector_id = auth.uid()
    OR
    (
      current_user_role() IN ('manager', 'admin')
      AND vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE company_id = current_user_company_id()
      )
    )
    OR
    current_user_role() = 'admin'
  )
  WITH CHECK (
    inspector_id = auth.uid()
    OR
    (
      current_user_role() IN ('manager', 'admin')
      AND vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE company_id = current_user_company_id()
      )
    )
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete reports"
  ON inspection_reports FOR DELETE
  TO authenticated
  USING (current_user_role() = 'admin');

-- INSPECTION_SECTIONS
DROP POLICY IF EXISTS "All can view sections" ON inspection_sections;
DROP POLICY IF EXISTS "Admins can manage sections" ON inspection_sections;

CREATE POLICY "All can view sections"
  ON inspection_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage sections"
  ON inspection_sections FOR ALL
  TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- REPORT_SECTIONS
DROP POLICY IF EXISTS "Users can view report sections" ON report_sections;
DROP POLICY IF EXISTS "Authorized users can manage report sections" ON report_sections;

CREATE POLICY "Users can view report sections"
  ON report_sections FOR SELECT
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

CREATE POLICY "Authorized users can manage report sections"
  ON report_sections FOR ALL
  TO authenticated
  USING (
    report_id IN (SELECT id FROM inspection_reports WHERE inspector_id = auth.uid())
    OR
    (
      current_user_role() IN ('manager', 'admin')
      AND report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
    )
    OR
    current_user_role() = 'admin'
  )
  WITH CHECK (
    report_id IN (SELECT id FROM inspection_reports WHERE inspector_id = auth.uid())
    OR
    (
      current_user_role() IN ('manager', 'admin')
      AND report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
    )
    OR
    current_user_role() = 'admin'
  );

-- INSPECTION_ITEMS
DROP POLICY IF EXISTS "Users can view inspection items" ON inspection_items;
DROP POLICY IF EXISTS "Authorized users can manage inspection items" ON inspection_items;

CREATE POLICY "Users can view inspection items"
  ON inspection_items FOR SELECT
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      WHERE rs.report_id IN (
        SELECT ir.id FROM inspection_reports ir
        WHERE ir.vehicle_id IN (
          SELECT id FROM vehicles 
          WHERE company_id = current_user_company_id()
        )
      )
    )
    OR
    current_user_role() = 'admin'
  );

CREATE POLICY "Authorized users can manage inspection items"
  ON inspection_items FOR ALL
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      WHERE rs.report_id IN (SELECT id FROM inspection_reports WHERE inspector_id = auth.uid())
    )
    OR
    (
      current_user_role() IN ('manager', 'admin')
      AND report_section_id IN (
        SELECT rs.id FROM report_sections rs
        WHERE rs.report_id IN (
          SELECT ir.id FROM inspection_reports ir
          WHERE ir.vehicle_id IN (
            SELECT id FROM vehicles 
            WHERE company_id = current_user_company_id()
          )
        )
      )
    )
    OR
    current_user_role() = 'admin'
  )
  WITH CHECK (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      WHERE rs.report_id IN (SELECT id FROM inspection_reports WHERE inspector_id = auth.uid())
    )
    OR
    (
      current_user_role() IN ('manager', 'admin')
      AND report_section_id IN (
        SELECT rs.id FROM report_sections rs
        WHERE rs.report_id IN (
          SELECT ir.id FROM inspection_reports ir
          WHERE ir.vehicle_id IN (
            SELECT id FROM vehicles 
            WHERE company_id = current_user_company_id()
          )
        )
      )
    )
    OR
    current_user_role() = 'admin'
  );