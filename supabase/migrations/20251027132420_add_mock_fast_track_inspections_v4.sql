/*
  # Add Mock Inspections with Fast Track Data

  Creates 4 test vehicles demonstrating different fast track scenarios with damages
*/

-- Set first company to have fast track disabled
UPDATE companies
SET is_fast_track_disabled = true
WHERE id = (SELECT id FROM companies ORDER BY created_at LIMIT 1);

-- Create mock vehicles and damages
DO $$
DECLARE
  company_ftd uuid;
  company_fte uuid;
  test_user_id uuid;
  vid1 uuid; vid2 uuid; vid3 uuid; vid4 uuid;
  rid1 uuid; rid2 uuid; rid3 uuid; rid4 uuid;
  iid1 uuid; iid2 uuid; iid3 uuid; iid4 uuid;
BEGIN
  SELECT id INTO company_ftd FROM companies WHERE is_fast_track_disabled = true LIMIT 1;
  SELECT id INTO company_fte FROM companies WHERE COALESCE(is_fast_track_disabled, false) = false LIMIT 1;
  SELECT id INTO test_user_id FROM user_profiles LIMIT 1;

  -- Vehicle 1: Fast track disabled, no manual review
  vid1 := gen_random_uuid();
  INSERT INTO vehicles (id, registration, make, model, year, mileage, company_id, status, inspection_date, estimated_value, estimated_cost, customer_email, inspection_type, image_url)
  VALUES (vid1, 'FTD-001', 'Toyota', 'Corolla', 2023, 15000, company_ftd, 'inspected', NOW() - INTERVAL '2 days', 25000, 1200, 'customer1@example.com', 'api', 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg');

  rid1 := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, report_date, photos_date, inspector_id, report_status, manual_review_completed)
  VALUES (rid1, vid1, 'TCHEK-FTD-001', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', test_user_id, 'completed', false);

  iid1 := gen_random_uuid();
  INSERT INTO damage_images (id, report_id, image_url, section_id, part_name, image_type)
  VALUES (iid1, rid1, 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg', 'car_body', 'Front Bumper', 'damage');

  INSERT INTO damages (report_id, image_id, damage_group_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score)
  VALUES
    (rid1, iid1, gen_random_uuid(), 'car_body', 'Front Bumper', 'Center', 'Scratch', 3, 'validated', '{"x": 100, "y": 150, "width": 200, "height": 100}'::jsonb, 0.92),
    (rid1, iid1, gen_random_uuid(), 'car_body', 'Front Left Door', 'Lower', 'Dent', 4, 'validated', '{"x": 150, "y": 200, "width": 180, "height": 120}'::jsonb, 0.88),
    (rid1, iid1, gen_random_uuid(), 'car_body', 'Hood', 'Center', 'Paint Chip', 2, 'validated', '{"x": 200, "y": 100, "width": 50, "height": 50}'::jsonb, 0.85);

  -- Vehicle 2: Fast track enabled, no manual review
  vid2 := gen_random_uuid();
  INSERT INTO vehicles (id, registration, make, model, year, mileage, company_id, status, inspection_date, estimated_value, estimated_cost, customer_email, inspection_type, image_url)
  VALUES (vid2, 'FTE-002', 'Honda', 'Civic', 2022, 22000, company_fte, 'inspected', NOW() - INTERVAL '1 day', 22000, 850, 'customer2@example.com', 'api', 'https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg');

  rid2 := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, report_date, photos_date, inspector_id, report_status, manual_review_completed)
  VALUES (rid2, vid2, 'TCHEK-FTE-002', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', test_user_id, 'completed', false);

  iid2 := gen_random_uuid();
  INSERT INTO damage_images (id, report_id, image_url, section_id, part_name, image_type)
  VALUES (iid2, rid2, 'https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg', 'car_body', 'Rear Bumper', 'damage');

  INSERT INTO damages (report_id, image_id, damage_group_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score)
  VALUES
    (rid2, iid2, gen_random_uuid(), 'car_body', 'Rear Bumper', 'Right', 'Scratch', 2, 'validated', '{"x": 120, "y": 180, "width": 150, "height": 80}'::jsonb, 0.90),
    (rid2, iid2, gen_random_uuid(), 'car_body', 'Rear Right Door', 'Upper', 'Dent', 5, 'validated', '{"x": 180, "y": 220, "width": 200, "height": 150}'::jsonb, 0.94);

  -- Vehicle 3: Fast track enabled, manual review completed
  vid3 := gen_random_uuid();
  INSERT INTO vehicles (id, registration, make, model, year, mileage, company_id, status, inspection_date, estimated_value, estimated_cost, customer_email, inspection_type, image_url)
  VALUES (vid3, 'FTE-003', 'Ford', 'Focus', 2021, 35000, company_fte, 'inspected', NOW() - INTERVAL '3 hours', 19000, 1500, 'customer3@example.com', 'api', 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg');

  rid3 := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, report_date, photos_date, inspector_id, report_status, manual_review_completed, manual_review_completed_at, manual_review_completed_by)
  VALUES (rid3, vid3, 'TCHEK-FTE-003', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', test_user_id, 'completed', true, NOW() - INTERVAL '2 hours', test_user_id);

  iid3 := gen_random_uuid();
  INSERT INTO damage_images (id, report_id, image_url, section_id, part_name, image_type)
  VALUES (iid3, rid3, 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg', 'car_body', 'Front Left Fender', 'damage');

  INSERT INTO damages (report_id, image_id, damage_group_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, reviewed_by, reviewed_at)
  VALUES
    (rid3, iid3, gen_random_uuid(), 'car_body', 'Front Left Fender', 'Upper', 'Dent', 4, 'validated', '{"x": 140, "y": 160, "width": 170, "height": 110}'::jsonb, 0.91, test_user_id, NOW() - INTERVAL '2 hours'),
    (rid3, iid3, gen_random_uuid(), 'car_body', 'Windshield', 'Center', 'Crack', 5, 'validated', '{"x": 250, "y": 150, "width": 300, "height": 200}'::jsonb, 0.96, test_user_id, NOW() - INTERVAL '2 hours'),
    (rid3, iid3, gen_random_uuid(), 'car_body', 'Roof', 'Center', 'Hail Damage', 3, 'validated', '{"x": 200, "y": 100, "width": 250, "height": 180}'::jsonb, 0.89, test_user_id, NOW() - INTERVAL '2 hours');

  -- Vehicle 4: Fast track disabled, manual review completed
  vid4 := gen_random_uuid();
  INSERT INTO vehicles (id, registration, make, model, year, mileage, company_id, status, inspection_date, estimated_value, estimated_cost, customer_email, inspection_type, image_url)
  VALUES (vid4, 'FTD-004', 'Volkswagen', 'Golf', 2023, 12000, company_ftd, 'inspected', NOW() - INTERVAL '1 hour', 26000, 950, 'customer4@example.com', 'api', 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg');

  rid4 := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, report_date, photos_date, inspector_id, report_status, manual_review_completed, manual_review_completed_at, manual_review_completed_by)
  VALUES (rid4, vid4, 'TCHEK-FTD-004', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', test_user_id, 'completed', true, NOW() - INTERVAL '30 minutes', test_user_id);

  iid4 := gen_random_uuid();
  INSERT INTO damage_images (id, report_id, image_url, section_id, part_name, image_type)
  VALUES (iid4, rid4, 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg', 'car_body', 'Rear Left Quarter Panel', 'damage');

  INSERT INTO damages (report_id, image_id, damage_group_id, section_id, part_name, location, damage_type, severity, status, bounding_box, confidence_score, reviewed_by, reviewed_at)
  VALUES
    (rid4, iid4, gen_random_uuid(), 'car_body', 'Rear Left Quarter Panel', 'Lower', 'Scratch', 2, 'validated', '{"x": 110, "y": 190, "width": 140, "height": 90}'::jsonb, 0.86, test_user_id, NOW() - INTERVAL '30 minutes'),
    (rid4, iid4, gen_random_uuid(), 'car_body', 'Trunk/Tailgate', 'Center', 'Dent', 3, 'validated', '{"x": 200, "y": 250, "width": 160, "height": 120}'::jsonb, 0.93, test_user_id, NOW() - INTERVAL '30 minutes');

END $$;
