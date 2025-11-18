/*
  # Row Level Security Policies

  ## Overview
  This migration implements comprehensive Row Level Security (RLS) policies for all tables.
  Policies are RESTRICTIVE by default and only grant access where explicitly needed.

  ## Security Model
  1. **Admin users** (role = 'admin') - Full access to all data
  2. **Company users** - Access only to their company's data
  3. **Inspectors** - Can create and modify their own reports
  4. **Managers** - Read access to company data
  5. **Viewers** - Read-only access to company data

  ## Policy Structure
  - Each table has separate policies for SELECT, INSERT, UPDATE, DELETE
  - Policies check both authentication status AND authorization
  - All policies use auth.uid() for user identification
  - Company isolation enforced through company_id checks

  ## Important Notes
  - After enabling RLS, tables are locked down by default
  - Users must be authenticated to access ANY data
  - Policies explicitly grant minimum required access
  - inspection_sections table is read-only for all users (global templates)
*/

-- ============================================================================
-- COMPANIES TABLE POLICIES
-- ============================================================================

-- Admins can view all companies
CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Users can view their own company
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND company_id IS NOT NULL
    )
  );

-- Only admins can insert companies
CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can update companies
CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can delete companies
CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================
-- USER_PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Users in same company can view each other
CREATE POLICY "Company members can view each other"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND company_id IS NOT NULL
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent users from changing their own role or company_id
    AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
    AND (company_id IS NULL OR company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid()))
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- New users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- VEHICLES TABLE POLICIES
-- ============================================================================

-- Admins can view all vehicles
CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Users can view vehicles from their company
CREATE POLICY "Users can view company vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND company_id IS NOT NULL
    )
  );

-- Inspectors and managers can insert vehicles for their company
CREATE POLICY "Authorized users can insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('inspector', 'manager', 'admin')
      AND company_id IS NOT NULL
    )
  );

-- Inspectors and managers can update vehicles from their company
CREATE POLICY "Authorized users can update company vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('inspector', 'manager', 'admin')
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('inspector', 'manager', 'admin')
    )
  );

-- Only admins can delete vehicles
CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================
-- INSPECTION_REPORTS TABLE POLICIES
-- ============================================================================

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON inspection_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Users can view reports for vehicles from their company
CREATE POLICY "Users can view company reports"
  ON inspection_reports FOR SELECT
  TO authenticated
  USING (
    vehicle_id IN (
      SELECT v.id FROM vehicles v
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.company_id IS NOT NULL
    )
  );

-- Inspectors can create reports for vehicles from their company
CREATE POLICY "Inspectors can insert reports"
  ON inspection_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    vehicle_id IN (
      SELECT v.id FROM vehicles v
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('inspector', 'manager', 'admin')
    )
    AND inspector_id = auth.uid()
  );

-- Inspectors can update their own reports
CREATE POLICY "Inspectors can update own reports"
  ON inspection_reports FOR UPDATE
  TO authenticated
  USING (inspector_id = auth.uid())
  WITH CHECK (inspector_id = auth.uid());

-- Managers and admins can update reports for their company
CREATE POLICY "Managers can update company reports"
  ON inspection_reports FOR UPDATE
  TO authenticated
  USING (
    vehicle_id IN (
      SELECT v.id FROM vehicles v
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    vehicle_id IN (
      SELECT v.id FROM vehicles v
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  );

-- Only admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON inspection_reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================
-- INSPECTION_SECTIONS TABLE POLICIES (Read-only for all authenticated users)
-- ============================================================================

-- All authenticated users can view inspection section templates
CREATE POLICY "Authenticated users can view sections"
  ON inspection_sections FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert section templates
CREATE POLICY "Admins can insert sections"
  ON inspection_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can update section templates
CREATE POLICY "Admins can update sections"
  ON inspection_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can delete section templates
CREATE POLICY "Admins can delete sections"
  ON inspection_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================
-- REPORT_SECTIONS TABLE POLICIES
-- ============================================================================

-- Users can view report sections for reports they have access to
CREATE POLICY "Users can view accessible report sections"
  ON report_sections FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Inspectors can insert sections for their reports
CREATE POLICY "Inspectors can insert report sections"
  ON report_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    report_id IN (
      SELECT id FROM inspection_reports
      WHERE inspector_id = auth.uid()
    )
    OR
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  );

-- Inspectors can update sections in their reports
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

-- Managers can update sections in company reports
CREATE POLICY "Managers can update company report sections"
  ON report_sections FOR UPDATE
  TO authenticated
  USING (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  );

-- Inspectors and managers can delete sections
CREATE POLICY "Authorized users can delete report sections"
  ON report_sections FOR DELETE
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM inspection_reports
      WHERE inspector_id = auth.uid()
    )
    OR
    report_id IN (
      SELECT ir.id FROM inspection_reports ir
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  );

-- ============================================================================
-- INSPECTION_ITEMS TABLE POLICIES
-- ============================================================================

-- Users can view items for report sections they have access to
CREATE POLICY "Users can view accessible inspection items"
  ON inspection_items FOR SELECT
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Inspectors can insert items in their report sections
CREATE POLICY "Inspectors can insert inspection items"
  ON inspection_items FOR INSERT
  TO authenticated
  WITH CHECK (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      WHERE ir.inspector_id = auth.uid()
    )
    OR
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  );

-- Inspectors can update items in their report sections
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

-- Managers can update items in company report sections
CREATE POLICY "Managers can update company inspection items"
  ON inspection_items FOR UPDATE
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  );

-- Authorized users can delete items
CREATE POLICY "Authorized users can delete inspection items"
  ON inspection_items FOR DELETE
  TO authenticated
  USING (
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      WHERE ir.inspector_id = auth.uid()
    )
    OR
    report_section_id IN (
      SELECT rs.id FROM report_sections rs
      INNER JOIN inspection_reports ir ON rs.report_id = ir.id
      INNER JOIN vehicles v ON ir.vehicle_id = v.id
      INNER JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'admin')
    )
  );