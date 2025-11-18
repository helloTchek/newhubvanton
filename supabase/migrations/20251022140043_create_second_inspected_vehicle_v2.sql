/*
  # Create Second Inspected Vehicle with Comprehensive Damages

  Creates BMW 3 Series with damages across all categories.
*/

DO $$
DECLARE
  v_vehicle_id uuid := gen_random_uuid();
  v_report_id uuid := gen_random_uuid();
  v_company_id uuid;
  v_user_id uuid := '20142610-125b-49af-aaf7-c94e0d2131c7';
  v_image_id uuid;
BEGIN
  SELECT id INTO v_company_id FROM companies LIMIT 1;
  
  IF v_company_id IS NULL THEN
    v_company_id := '11111111-1111-1111-1111-111111111111';
  END IF;
  
  INSERT INTO vehicles (
    id, registration, make, model, year, mileage, company_id,
    status, inspection_date, estimated_value, estimated_cost,
    image_url, customer_email, customer_phone, inspection_type
  ) VALUES (
    v_vehicle_id, 'GH-789-IJ', 'BMW', '3 Series', 2020, 85000, v_company_id,
    'inspected', NOW() - INTERVAL '2 days', 28000, 2800,
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    'customer2@example.com', '+33612345679', 'full'
  );
  
  INSERT INTO inspection_reports (id, vehicle_id, inspector_id, tchek_id, report_date, report_status, total_cost)
  VALUES (v_report_id, v_vehicle_id, v_user_id, 'BMW-' || SUBSTRING(v_report_id::text, 1, 8), NOW() - INTERVAL '2 days', 'completed', 2800);
  
  -- CAR BODY: 4 damages
  v_image_id := gen_random_uuid();
  INSERT INTO damage_images VALUES (v_image_id, v_report_id, 'carbody', 'Door Rear Right',
    'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/sidePassenger.jpeg', 'damage', 0, '{}', NOW());
  INSERT INTO damages (report_id, image_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, notes) VALUES
    (v_report_id, v_image_id, 'carbody', 'Door Rear Right', 'middle', 'Dent', 4, 'pending', '{"x":180,"y":320,"width":140,"height":110}'::jsonb, 0.93, 'Large dent'),
    (v_report_id, v_image_id, 'carbody', 'Door Rear Right', 'edge', 'Scratch', 2, 'validated', '{"x":160,"y":420,"width":100,"height":40}'::jsonb, 0.81, 'Edge scratches');
  
  v_image_id := gen_random_uuid();
  INSERT INTO damage_images VALUES (v_image_id, v_report_id, 'carbody', 'Rear Bumper',
    'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/back.jpeg', 'damage', 0, '{}', NOW());
  INSERT INTO damages (report_id, image_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, notes) VALUES
    (v_report_id, v_image_id, 'carbody', 'Rear Bumper', 'center', 'Scratch', 3, 'pending', '{"x":200,"y":380,"width":160,"height":80}'::jsonb, 0.88, 'Impact scratches'),
    (v_report_id, v_image_id, 'carbody', 'Rear Bumper', 'corner', 'Paint Damage', 2, 'pending', '{"x":380,"y":400,"width":90,"height":70}'::jsonb, 0.76, 'Paint damage');
  
  -- INTERIOR: 4 damages
  v_image_id := gen_random_uuid();
  INSERT INTO damage_images VALUES (v_image_id, v_report_id, 'cabin', 'Dashboard',
    'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/dashboard.jpeg', 'damage', 0, '{}', NOW());
  INSERT INTO damages (report_id, image_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, notes) VALUES
    (v_report_id, v_image_id, 'cabin', 'Dashboard', 'console', 'Crack', 3, 'validated', '{"x":280,"y":300,"width":120,"height":60}'::jsonb, 0.89, 'Console crack'),
    (v_report_id, v_image_id, 'cabin', 'Dashboard', 'passenger', 'Scratch', 2, 'pending', '{"x":380,"y":240,"width":80,"height":50}'::jsonb, 0.74, 'Surface scratches');
  
  v_image_id := gen_random_uuid();
  INSERT INTO damage_images VALUES (v_image_id, v_report_id, 'cabin', 'Front Right Seat',
    'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/interior.jpeg', 'damage', 0, '{}', NOW());
  INSERT INTO damages (report_id, image_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, notes) VALUES
    (v_report_id, v_image_id, 'cabin', 'Front Right Seat', 'bolster', 'Wear', 3, 'pending', '{"x":220,"y":280,"width":110,"height":90}'::jsonb, 0.82, 'Seat wear'),
    (v_report_id, v_image_id, 'cabin', 'Steering Wheel', 'rim', 'Wear', 2, 'validated', '{"x":150,"y":180,"width":80,"height":80}'::jsonb, 0.79, 'Leather wear');
  
  -- GLAZING: 2 damages
  v_image_id := gen_random_uuid();
  INSERT INTO damage_images VALUES (v_image_id, v_report_id, 'glass', 'Right Mirror',
    'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/sidePassengerFrontInspect.jpeg', 'damage', 0, '{}', NOW());
  INSERT INTO damages (report_id, image_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, notes)
  VALUES (v_report_id, v_image_id, 'glass', 'Right Mirror', 'glass', 'Crack', 3, 'pending', '{"x":420,"y":200,"width":60,"height":80}'::jsonb, 0.91, 'Mirror crack');
  
  v_image_id := gen_random_uuid();
  INSERT INTO damage_images VALUES (v_image_id, v_report_id, 'glass', 'Rear Window',
    'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/back.jpeg', 'damage', 1, '{}', NOW());
  INSERT INTO damages (report_id, image_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, notes)
  VALUES (v_report_id, v_image_id, 'glass', 'Rear Window', 'corner', 'Chip', 1, 'validated', '{"x":380,"y":140,"width":30,"height":30}'::jsonb, 0.73, 'Small chip');
  
  -- DASHBOARD WARNING LIGHTS: 2 damages
  v_image_id := gen_random_uuid();
  INSERT INTO damage_images VALUES (v_image_id, v_report_id, 'dashboard', 'Warning Lights',
    'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/dashboard.jpeg', 'damage', 1, '{}', NOW());
  INSERT INTO damages (report_id, image_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, notes) VALUES
    (v_report_id, v_image_id, 'dashboard', 'Battery Warning', 'cluster', 'Warning Light', 3, 'pending', '{"x":240,"y":145,"width":50,"height":50}'::jsonb, 0.95, 'Battery warning active'),
    (v_report_id, v_image_id, 'dashboard', 'Airbag Warning', 'cluster', 'Warning Light', 4, 'pending', '{"x":320,"y":150,"width":50,"height":50}'::jsonb, 0.97, 'Airbag system fault');
  
  -- DECLARATIONS: 3 entries
  v_image_id := gen_random_uuid();
  INSERT INTO damage_images VALUES (v_image_id, v_report_id, 'declaration', 'Customer Declaration',
    'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/general.jpeg', 'general', 0, '{}', NOW());
  INSERT INTO damages (report_id, image_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, notes) VALUES
    (v_report_id, v_image_id, 'declaration', 'Customer Report', 'general', 'Pre-existing', 2, 'validated', '{}'::jsonb, 1.0, 'Door dent from parking lot 3 weeks ago'),
    (v_report_id, v_image_id, 'declaration', 'Customer Report', 'general', 'Electrical', 3, 'pending', '{}'::jsonb, 1.0, 'Intermittent battery warning in cold weather'),
    (v_report_id, v_image_id, 'declaration', 'Service History', 'general', 'Maintenance', 1, 'validated', '{}'::jsonb, 1.0, 'Full service history, last service 6 months ago');
  
  RAISE NOTICE 'BMW 3 Series created with % total damages', (SELECT COUNT(*) FROM damages WHERE report_id = v_report_id);
END $$;
