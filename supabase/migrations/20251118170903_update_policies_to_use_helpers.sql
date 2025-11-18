/*
  # Update All Policies to Use Helper Functions

  ## Overview
  Updates all RLS policies across all tables to use the helper functions
  instead of directly querying user_profiles, preventing recursion issues.

  ## Changes
  1. Drop existing policies that query user_profiles
  2. Recreate policies using helper functions (is_admin, get_user_company_id)

  ## Security
  - Maintains same security model
  - Eliminates infinite recursion
  - Uses SECURITY DEFINER functions safely
*/

-- ============================================================================
-- COMPANIES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- VEHICLES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can view company vehicles" ON vehicles;
DROP POLICY IF EXISTS "Authorized users can insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Authorized users can update company vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can delete vehicles" ON vehicles;

CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view company vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Authorized users can insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_user_company_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('inspector', 'manager', 'admin')
  );

CREATE POLICY "Authorized users can update company vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_user_company_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('inspector', 'manager', 'admin')
  )
  WITH CHECK (
    company_id = public.get_user_company_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('inspector', 'manager', 'admin')
  );

CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- INSPECTION_REPORTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all reports" ON inspection_reports;
DROP POLICY IF EXISTS "Users can view company reports" ON inspection_reports;
DROP POLICY IF EXISTS "Inspectors can insert reports" ON inspection_reports;
DROP POLICY IF EXISTS "Inspectors can update own reports" ON inspection_reports;
DROP POLICY IF EXISTS "Managers can update company reports" ON inspection_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON inspection_reports;

CREATE POLICY "Admins can view all reports"
  ON inspection_reports FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view company reports"
  ON inspection_reports FOR SELECT
  TO authenticated
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles
      WHERE company_id = public.get_user_company_id(auth.uid())
    )
  );

CREATE POLICY "Inspectors can insert reports"
  ON inspection_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM vehicles
      WHERE company_id = public.get_user_company_id(auth.uid())
    )
    AND inspector_id = auth.uid()
    AND public.get_user_role(auth.uid()) IN ('inspector', 'manager', 'admin')
  );

CREATE POLICY "Inspectors can update own reports"
  ON inspection_reports FOR UPDATE
  TO authenticated
  USING (inspector_id = auth.uid())
  WITH CHECK (inspector_id = auth.uid());

CREATE POLICY "Managers can update company reports"
  ON inspection_reports FOR UPDATE
  TO authenticated
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles
      WHERE company_id = public.get_user_company_id(auth.uid())
    )
    AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
  )
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM vehicles
      WHERE company_id = public.get_user_company_id(auth.uid())
    )
    AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
  );

CREATE POLICY "Admins can delete reports"
  ON inspection_reports FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- INSPECTION_SECTIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view sections" ON inspection_sections;
DROP POLICY IF EXISTS "Admins can insert sections" ON inspection_sections;
DROP POLICY IF EXISTS "Admins can update sections" ON inspection_sections;
DROP POLICY IF EXISTS "Admins can delete sections" ON inspection_sections;

CREATE POLICY "Authenticated users can view sections"
  ON inspection_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert sections"
  ON inspection_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update sections"
  ON inspection_sections FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete sections"
  ON inspection_sections FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- REPORT_SECTIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view accessible report sections" ON report_sections;
DROP POLICY IF EXISTS "Inspectors can insert report sections" ON report_sections;
DROP POLICY IF EXISTS "Inspectors can update own report sections" ON report_sections;
DROP POLICY IF EXISTS "Managers can update company report sections" ON report_sections;
DROP POLICY IF EXISTS "Authorized users can delete report sections" ON report_sections;

CREATE POLICY "Users can view accessible report sections"
  ON report_sections FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Inspectors can insert report sections"
  ON report_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    report_id IN (
      SELECT id FROM inspection_reports
      WHERE inspector_id = auth.uid()
    )
    OR (
      report_id IN (
        SELECT ir.id FROM inspection_reports ir
        INNER JOIN vehicles v ON ir.vehicle_id = v.id
        WHERE v.company_id = public.get_user_company_id(auth.uid())
      )
      AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
    )
  );

CREATE POLICY "Inspectors can update own report sections"
  ON report_sections FOR UPDATE
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM inspection_reports
      WHERE inspector_id = auth.uid()
    )
  )
  WITH CHECK (
    report_id IN (
      SELECT id FROM inspection_reports
      WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Managers can update company report sections"
  ON report_sections FOR UPDATE
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
    AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
  )
  WITH CHECK (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
    AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
  );

CREATE POLICY "Authorized users can delete report sections"
  ON report_sections FOR DELETE
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM inspection_reports
      WHERE inspector_id = auth.uid()
    )
    OR (
      report_id IN (
        SELECT ir.id FROM inspection_reports ir
        INNER JOIN vehicles v ON ir.vehicle_id = v.id
        WHERE v.company_id = public.get_user_company_id(auth.uid())
      )
      AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
    )
  );

-- ============================================================================
-- INSPECTION_ITEMS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view accessible inspection items" ON inspection_items;
DROP POLICY IF EXISTS "Inspectors can insert inspection items" ON inspection_items;
DROP POLICY IF EXISTS "Inspectors can update own inspection items" ON inspection_items;
DROP POLICY IF EXISTS "Managers can update company inspection items" ON inspection_items;
DROP POLICY IF EXISTS "Authorized users can delete inspection items" ON inspection_items;

CREATE POLICY "Users can view accessible inspection items"
  ON inspection_items FOR SELECT
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Inspectors can insert inspection items"
  ON inspection_items FOR INSERT
  TO authenticated
  WITH CHECK (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      WHERE ir.inspector_id = auth.uid()
    )
    OR (
      report_section_id IN (
        SELECT rs.id FROM report_sections rs
        INNER JOIN inspection_reports ir ON rs.report_id = ir.id
        INNER JOIN vehicles v ON ir.vehicle_id = v.id
        WHERE v.company_id = public.get_user_company_id(auth.uid())
      )
      AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
    )
  );

CREATE POLICY "Inspectors can update own inspection items"
  ON inspection_items FOR UPDATE
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      WHERE ir.inspector_id = auth.uid()
    )
  )
  WITH CHECK (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      WHERE ir.inspector_id = auth.uid()
    )
  );

CREATE POLICY "Managers can update company inspection items"
  ON inspection_items FOR UPDATE
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
    AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
  )
  WITH CHECK (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
    AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
  );

CREATE POLICY "Authorized users can delete inspection items"
  ON inspection_items FOR DELETE
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      WHERE ir.inspector_id = auth.uid()
    )
    OR (
      report_section_id IN (
        SELECT rs.id FROM report_sections rs
        INNER JOIN inspection_reports ir ON rs.report_id = ir.id
        INNER JOIN vehicles v ON ir.vehicle_id = v.id
        WHERE v.company_id = public.get_user_company_id(auth.uid())
      )
      AND public.get_user_role(auth.uid()) IN ('manager', 'admin')
    )
  );