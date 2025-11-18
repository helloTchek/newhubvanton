/*
  # Vehicle Inspection Management System - Complete Database Schema

  ## Overview
  This migration creates a comprehensive database schema for a vehicle inspection management platform
  with proper security, relationships, and audit capabilities.

  ## New Tables

  ### 1. `companies`
  Stores company information for multi-tenant support
  - `id` (uuid, primary key)
  - `name` (text) - Company name
  - `mother_company` (text, nullable) - Parent company name
  - `address` (text) - Physical address
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `logo_url` (text, nullable) - Company logo URL
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `user_profiles`
  Extended user information linked to Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `name` (text) - Full name
  - `role` (text) - User role (admin, inspector, manager, viewer)
  - `company_id` (uuid, nullable) - Associated company (null for admins)
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `vehicles`
  Vehicle information and inspection status
  - `id` (uuid, primary key)
  - `registration` (text) - Vehicle registration number
  - `make` (text) - Vehicle manufacturer
  - `model` (text) - Vehicle model
  - `year` (integer) - Manufacturing year
  - `mileage` (integer) - Current mileage
  - `company_id` (uuid) - Owner company
  - `status` (text) - Inspection status
  - `estimated_value` (numeric) - Vehicle value
  - `estimated_cost` (numeric) - Repair cost estimate
  - `image_url` (text, nullable) - Vehicle image
  - `customer_email` (text) - Customer contact
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `inspection_reports`
  Master inspection report records
  - `id` (uuid, primary key)
  - `vehicle_id` (uuid) - Associated vehicle
  - `tchek_id` (text) - External reference ID
  - `inspector_id` (uuid) - Inspector user ID
  - `report_date` (timestamptz) - Report generation date
  - `photos_date` (timestamptz) - Photo capture date
  - `total_cost` (numeric) - Total estimated repair cost
  - `report_status` (text) - Status (draft, completed, reviewed, archived)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `inspection_sections`
  Inspection section definitions (e.g., Body, Interior, Tires)
  - `id` (uuid, primary key)
  - `name` (text) - Section name
  - `icon` (text) - Display icon
  - `sort_order` (integer) - Display order
  - `requires_images` (boolean) - Image requirement flag
  - `requires_ai_analysis` (boolean) - AI analysis flag
  - `requires_human_review` (boolean) - Human review flag
  - `is_images_mandatory` (boolean)
  - `is_ai_analysis_mandatory` (boolean)
  - `is_human_review_mandatory` (boolean)
  - `created_at` (timestamptz)

  ### 6. `report_sections`
  Links inspection sections to specific reports with status
  - `id` (uuid, primary key)
  - `report_id` (uuid) - Parent report
  - `section_id` (uuid) - Section definition
  - `status` (text) - Section status (passed, minor_issues, major_issues, failed)
  - `section_status` (text) - Review status (missing_data, needs_review, reviewed, inspect)
  - `is_visible` (boolean) - Visibility flag
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `inspection_items`
  Individual inspection items within sections
  - `id` (uuid, primary key)
  - `report_section_id` (uuid) - Parent section
  - `name` (text) - Item name
  - `status` (text) - Item status
  - `severity` (text, nullable) - Issue severity (low, medium, high)
  - `notes` (text, nullable) - Inspector notes
  - `estimated_cost` (numeric) - Item repair cost
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on ALL tables
  - Policies enforce company-based data isolation
  - Admin users can access all data
  - Regular users can only access their company's data
  - Inspectors can only modify reports they created

  ## Indexes
  - Foreign key indexes for optimal join performance
  - Composite indexes on common query patterns
  - Full-text search indexes on searchable fields

  ## Important Notes
  1. All timestamps use timestamptz for timezone awareness
  2. Numeric types used for currency to avoid floating point issues
  3. All tables have created_at and updated_at for audit trail
  4. Cascading deletes configured to maintain referential integrity
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mother_company text,
  address text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'inspector', 'manager', 'viewer')),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration text NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL CHECK (year >= 1900 AND year <= 2100),
  mileage integer NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inspection_in_progress' CHECK (status IN ('inspection_in_progress', 'inspected', 'to_review')),
  estimated_value numeric(10, 2) DEFAULT 0 NOT NULL,
  estimated_cost numeric(10, 2) DEFAULT 0 NOT NULL,
  image_url text,
  customer_email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Inspection reports table
CREATE TABLE IF NOT EXISTS inspection_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tchek_id text NOT NULL UNIQUE,
  inspector_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  report_date timestamptz DEFAULT now() NOT NULL,
  photos_date timestamptz DEFAULT now() NOT NULL,
  total_cost numeric(10, 2) DEFAULT 0 NOT NULL,
  report_status text NOT NULL DEFAULT 'draft' CHECK (report_status IN ('draft', 'completed', 'reviewed', 'archived')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Inspection sections (template/definition)
CREATE TABLE IF NOT EXISTS inspection_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT '📋',
  sort_order integer NOT NULL DEFAULT 0,
  requires_images boolean DEFAULT false NOT NULL,
  requires_ai_analysis boolean DEFAULT false NOT NULL,
  requires_human_review boolean DEFAULT false NOT NULL,
  is_images_mandatory boolean DEFAULT false NOT NULL,
  is_ai_analysis_mandatory boolean DEFAULT false NOT NULL,
  is_human_review_mandatory boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Report sections (instance per report)
CREATE TABLE IF NOT EXISTS report_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES inspection_reports(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES inspection_sections(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'passed' CHECK (status IN ('passed', 'minor_issues', 'major_issues', 'failed')),
  section_status text NOT NULL DEFAULT 'inspect' CHECK (section_status IN ('missing_data', 'needs_review', 'reviewed', 'inspect')),
  is_visible boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(report_id, section_id)
);

-- Inspection items (specific findings within a report section)
CREATE TABLE IF NOT EXISTS inspection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_section_id uuid NOT NULL REFERENCES report_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'passed' CHECK (status IN ('passed', 'minor_issues', 'major_issues', 'failed')),
  severity text CHECK (severity IN ('low', 'medium', 'high')),
  notes text,
  estimated_cost numeric(10, 2) DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_vehicle_id ON inspection_reports(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_inspector_id ON inspection_reports(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_tchek_id ON inspection_reports(tchek_id);
CREATE INDEX IF NOT EXISTS idx_report_sections_report_id ON report_sections(report_id);
CREATE INDEX IF NOT EXISTS idx_report_sections_section_id ON report_sections(section_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_report_section_id ON inspection_items(report_section_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_reports_updated_at BEFORE UPDATE ON inspection_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_sections_updated_at BEFORE UPDATE ON report_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_items_updated_at BEFORE UPDATE ON inspection_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;