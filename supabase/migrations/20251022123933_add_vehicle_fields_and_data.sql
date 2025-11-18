/*
  # Add vehicle fields and populate test data

  1. Changes
    - Add customer_phone column
    - Add inspection_date column
    - Add inspection_type column
    - Populate vehicles table with test data for various statuses

  2. Notes
    - Provides comprehensive test data for chase-up functionality
    - All vehicles have proper UUIDs and realistic data
*/

-- Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN customer_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'inspection_date'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN inspection_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'inspection_type'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN inspection_type text DEFAULT 'api';
  END IF;
END $$;

-- Update existing vehicle
UPDATE vehicles 
SET customer_phone = '+33 6 12 34 56 78'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Insert test vehicles
INSERT INTO vehicles (id, registration, make, model, year, mileage, company_id, status, estimated_value, estimated_cost, image_url, customer_email, customer_phone, inspection_type, inspection_date, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'EF-456-GH', 'Peugeot', '308', 2022, 15000, '11111111-1111-1111-1111-111111111111', 'link_sent', 22000, 0, 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400', 'marie.martin@autocorp.com', '+33 6 23 45 67 89', 'webapp', NULL, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'IJ-789-KL', 'Volkswagen', 'Golf', 2020, 45000, '11111111-1111-1111-1111-111111111111', 'link_sent', 16500, 0, 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400', 'pierre.durand@autocorp.com', '+33 6 34 56 78 90', 'webapp', NULL, NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'MN-012-OP', 'Ford', 'Focus', 2021, 28000, '11111111-1111-1111-1111-111111111111', 'chased_up_1', 19000, 0, 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=400', 'sophie.bernard@autocorp.com', '+33 6 45 67 89 01', 'webapp', NULL, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'QR-345-ST', 'Toyota', 'Corolla', 2019, 62000, '11111111-1111-1111-1111-111111111111', 'chased_up_1', 14500, 0, 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400', 'luc.petit@autocorp.com', '+33 6 56 78 90 12', 'manual_upload', NULL, NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'UV-678-WX', 'BMW', '320d', 2022, 12000, '11111111-1111-1111-1111-111111111111', 'chased_up_2', 32000, 0, 'https://images.pexels.com/photos/241316/pexels-photo-241316.jpeg?auto=compress&cs=tinysrgb&w=400', 'julie.roux@autocorp.com', '+33 6 67 89 01 23', 'webapp', NULL, NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'YZ-901-AB', 'Audi', 'A4', 2021, 35000, '11111111-1111-1111-1111-111111111111', 'inspection_in_progress', 28000, 0, 'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=400', 'thomas.moreau@autocorp.com', '+33 6 78 90 12 34', 'webapp', NOW() - INTERVAL '2 hours', NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', 'CD-234-EF', 'Mercedes', 'C-Class', 2023, 8000, '11111111-1111-1111-1111-111111111111', 'inspected', 38000, 1500, 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400', 'emma.laurent@autocorp.com', '+33 6 89 01 23 45', 'api', NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'GH-567-IJ', 'Nissan', 'Qashqai', 2018, 95000, '11111111-1111-1111-1111-111111111111', 'archived', 12000, 0, 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400', 'nicolas.simon@autocorp.com', '+33 6 90 12 34 56', 'manual_upload', NOW() - INTERVAL '3 months', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;