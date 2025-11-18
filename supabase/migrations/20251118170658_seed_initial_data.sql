/*
  # Seed Initial Data

  ## Overview
  This migration seeds the database with initial data for testing and development.

  ## Data Created
  1. Sample companies
  2. Inspection section templates
  
  Note: Users must be created through Supabase Auth dashboard or signup endpoint.
*/

-- Insert sample companies
INSERT INTO companies (id, name, mother_company, address, email, phone, logo_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'AutoCorp Solutions', 'GlobalAuto Holdings', '123 Business Ave, Paris, France', 'contact@autocorp.com', '+33 1 23 45 67 89', 'https://images.pexels.com/photos/1308624/pexels-photo-1308624.jpeg?auto=compress&cs=tinysrgb&w=100'),
  ('22222222-2222-2222-2222-222222222222', 'Fleet Management Pro', NULL, '456 Industrial Blvd, Lyon, France', 'hello@fleetpro.com', '+33 4 76 54 32 10', 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=100'),
  ('33333333-3333-3333-3333-333333333333', 'Urban Transport Ltd', 'CityMove Group', '789 Transport St, Marseille, France', 'info@urbantransport.com', '+33 4 91 12 34 56', 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=100')
ON CONFLICT (id) DO NOTHING;

-- Insert inspection section templates
INSERT INTO inspection_sections (name, icon, sort_order, requires_images, requires_ai_analysis, requires_human_review, is_images_mandatory, is_ai_analysis_mandatory, is_human_review_mandatory) VALUES
  ('Car Body', '🚗', 1, true, true, true, true, true, false),
  ('Rim', '⚡', 2, true, true, false, true, true, false),
  ('Interior', '🪑', 3, true, true, true, true, true, true),
  ('Tires', '🛞', 4, true, true, false, true, true, false),
  ('Motor', '🔧', 5, true, true, true, true, false, false),
  ('Glass', '🪟', 6, true, true, false, true, true, false),
  ('Documents', '📄', 7, false, false, true, false, false, true),
  ('Declaration', '📋', 8, false, false, true, false, false, false)
ON CONFLICT (name) DO NOTHING;