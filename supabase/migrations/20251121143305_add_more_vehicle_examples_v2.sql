/*
  # Add More Vehicle Examples

  1. Overview
    - Adds 20 additional vehicles with diverse makes, models, and statuses
    - Includes various European registrations
    - Covers all status types for testing
    - Creates corresponding inspection reports for inspected vehicles

  2. New Vehicles Added
    - Various makes: Citroën, Seat, Skoda, Volvo, Opel, Hyundai, Kia, Mazda, Honda, etc.
    - Different statuses: link_sent, chased_up_1, chased_up_2, inspection_in_progress, inspected
    - Realistic VIN numbers
    - Various mileages

  3. Notes
    - All vehicles belong to AutoCorp Solutions company
    - Inspection reports created for inspected vehicles
*/

DO $$
DECLARE
  v_company_id uuid := '11111111-1111-1111-1111-111111111111';
  v_inspector_id uuid;
  v_vehicle_id uuid;
  v_report_id uuid;
BEGIN
  -- Get first user as inspector
  SELECT id INTO v_inspector_id FROM auth.users LIMIT 1;

  RAISE NOTICE 'Adding 20 more vehicle examples...';

  -- 1. Citroën C3 - Link Sent
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('KL-234-MN', 'Citroën', 'C3', 'VF7SXHMC5AB123456', 2022, 15000, 'link_sent', v_company_id, 'customer1@example.com');

  -- 2. Seat Leon - Chased Up 1
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('OP-567-QR', 'Seat', 'Leon', 'VSSZZZ5FZXR123789', 2021, 42000, 'chased_up_1', v_company_id, 'customer2@example.com');

  -- 3. Skoda Octavia - Chased Up 2
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email, customer_phone)
  VALUES ('ST-890-UV', 'Skoda', 'Octavia', 'TMBJK7NE5L4567890', 2020, 68000, 'chased_up_2', v_company_id, 'customer3@example.com', '+33612345678');

  -- 4. Volvo XC60 - Inspection In Progress
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email, inspection_type)
  VALUES ('WX-123-YZ', 'Volvo', 'XC60', 'YV1DZ8256L2345678', 2023, 8500, 'inspection_in_progress', v_company_id, 'customer4@example.com', 'Full');

  -- 5. Opel Corsa - Inspected with Report
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, images, inspection_date, customer_email)
  VALUES ('AB-456-CD', 'Opel', 'Corsa', 'W0L0SDL08D5456789', 2021, 28000, 'inspected', v_company_id,
    ARRAY['https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg', 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg']::text[],
    NOW() - INTERVAL '2 days', 'customer5@example.com')
  RETURNING id INTO v_vehicle_id;
  
  v_report_id := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, inspector_id, report_date, total_cost, report_status)
  VALUES (v_report_id, v_vehicle_id, 'TCK-' || SUBSTRING(v_report_id::text, 1, 8), v_inspector_id, NOW() - INTERVAL '2 days', 450.00, 'completed');
  UPDATE vehicles SET report_id = v_report_id WHERE id = v_vehicle_id;

  -- 6. Hyundai i30 - Inspected Fast Track
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, images, inspection_date, customer_email)
  VALUES ('EF-789-GH', 'Hyundai', 'i30', 'KMHDU4BD5HU234567', 2022, 18500, 'inspected', v_company_id,
    ARRAY['https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg']::text[],
    NOW() - INTERVAL '1 day', 'customer6@example.com')
  RETURNING id INTO v_vehicle_id;
  
  v_report_id := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, inspector_id, report_date, total_cost, report_status)
  VALUES (v_report_id, v_vehicle_id, 'TCK-' || SUBSTRING(v_report_id::text, 1, 8), v_inspector_id, NOW() - INTERVAL '1 day', 0.00, 'completed');
  UPDATE vehicles SET report_id = v_report_id WHERE id = v_vehicle_id;

  -- 7. Kia Sportage - Link Sent
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('IJ-012-KL', 'Kia', 'Sportage', 'KNDPM3AC9K7345678', 2023, 12000, 'link_sent', v_company_id, 'customer7@example.com');

  -- 8. Mazda CX-5 - Chased Up 1
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('MN-345-OP', 'Mazda', 'CX-5', 'JM3KFBCM3L0456789', 2022, 25000, 'chased_up_1', v_company_id, 'customer8@example.com');

  -- 9. Honda Civic - Inspected
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, images, inspection_date, customer_email)
  VALUES ('QR-678-ST', 'Honda', 'Civic', '2HGFC2F59LH567890', 2021, 35000, 'inspected', v_company_id,
    ARRAY['https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg', 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg']::text[],
    NOW() - INTERVAL '3 days', 'customer9@example.com')
  RETURNING id INTO v_vehicle_id;
  
  v_report_id := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, inspector_id, report_date, total_cost, report_status)
  VALUES (v_report_id, v_vehicle_id, 'TCK-' || SUBSTRING(v_report_id::text, 1, 8), v_inspector_id, NOW() - INTERVAL '3 days', 1250.00, 'completed');
  UPDATE vehicles SET report_id = v_report_id WHERE id = v_vehicle_id;

  -- 10. Fiat 500 - Link Sent
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('UV-901-WX', 'Fiat', '500', 'ZFA3120000P678901', 2023, 5000, 'link_sent', v_company_id, 'customer10@example.com');

  -- 11. Dacia Duster - Chased Up 2
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email, customer_phone)
  VALUES ('YZ-234-AB', 'Dacia', 'Duster', 'UU1HSRMD4MJ789012', 2020, 75000, 'chased_up_2', v_company_id, 'customer11@example.com', '+33698765432');

  -- 12. Mini Cooper - Inspected
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, images, inspection_date, customer_email)
  VALUES ('CD-567-EF', 'Mini', 'Cooper', 'WMWXP5C53NT890123', 2022, 22000, 'inspected', v_company_id,
    ARRAY['https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg']::text[],
    NOW() - INTERVAL '5 days', 'customer12@example.com')
  RETURNING id INTO v_vehicle_id;
  
  v_report_id := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, inspector_id, report_date, total_cost, report_status)
  VALUES (v_report_id, v_vehicle_id, 'TCK-' || SUBSTRING(v_report_id::text, 1, 8), v_inspector_id, NOW() - INTERVAL '5 days', 680.00, 'completed');
  UPDATE vehicles SET report_id = v_report_id WHERE id = v_vehicle_id;

  -- 13. Alfa Romeo Giulia - Inspection In Progress
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('GH-890-IJ', 'Alfa Romeo', 'Giulia', 'ZARFAMAM2L7901234', 2023, 9500, 'inspection_in_progress', v_company_id, 'customer13@example.com');

  -- 14. Jeep Renegade - Link Sent
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('KL-123-MN', 'Jeep', 'Renegade', 'ZACCJBCT9LPZ12345', 2022, 19000, 'link_sent', v_company_id, 'customer14@example.com');

  -- 15. Suzuki Swift - Chased Up 1
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('OP-456-QR', 'Suzuki', 'Swift', 'TSMMZC83S00234567', 2021, 32000, 'chased_up_1', v_company_id, 'customer15@example.com');

  -- 16. Mitsubishi Outlander - Inspected
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, images, inspection_date, customer_email)
  VALUES ('ST-789-UV', 'Mitsubishi', 'Outlander', 'JA4J3VA79LZ345678', 2023, 7500, 'inspected', v_company_id,
    ARRAY['https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg']::text[],
    NOW(), 'customer16@example.com')
  RETURNING id INTO v_vehicle_id;
  
  v_report_id := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, inspector_id, report_date, total_cost, report_status)
  VALUES (v_report_id, v_vehicle_id, 'TCK-' || SUBSTRING(v_report_id::text, 1, 8), v_inspector_id, NOW(), 0.00, 'completed');
  UPDATE vehicles SET report_id = v_report_id WHERE id = v_vehicle_id;

  -- 17. Land Rover Discovery - Chased Up 2
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('WX-012-YZ', 'Land Rover', 'Discovery Sport', 'SALCA2BN3LH456789', 2020, 85000, 'chased_up_2', v_company_id, 'customer17@example.com');

  -- 18. Tesla Model 3 - Inspected
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, images, inspection_date, customer_email)
  VALUES ('AB-345-CD', 'Tesla', 'Model 3', '5YJ3E1EA8LF567890', 2023, 15000, 'inspected', v_company_id,
    ARRAY['https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg', 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg']::text[],
    NOW() - INTERVAL '1 day', 'customer18@example.com')
  RETURNING id INTO v_vehicle_id;
  
  v_report_id := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, inspector_id, report_date, total_cost, report_status)
  VALUES (v_report_id, v_vehicle_id, 'TCK-' || SUBSTRING(v_report_id::text, 1, 8), v_inspector_id, NOW() - INTERVAL '1 day', 2100.00, 'completed');
  UPDATE vehicles SET report_id = v_report_id WHERE id = v_vehicle_id;

  -- 19. Porsche Cayenne - Link Sent
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, customer_email)
  VALUES ('EF-678-GH', 'Porsche', 'Cayenne', 'WP1AB2A22MLA78901', 2023, 6500, 'link_sent', v_company_id, 'customer19@example.com');

  -- 20. Lexus NX - Inspected
  INSERT INTO vehicles (registration, make, model, vin, year, mileage, status, company_id, images, inspection_date, customer_email)
  VALUES ('IJ-901-KL', 'Lexus', 'NX 300h', 'JTHBJRBA3L2890123', 2022, 21000, 'inspected', v_company_id,
    ARRAY['https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg']::text[],
    NOW() - INTERVAL '4 days', 'customer20@example.com')
  RETURNING id INTO v_vehicle_id;
  
  v_report_id := gen_random_uuid();
  INSERT INTO inspection_reports (id, vehicle_id, tchek_id, inspector_id, report_date, total_cost, report_status)
  VALUES (v_report_id, v_vehicle_id, 'TCK-' || SUBSTRING(v_report_id::text, 1, 8), v_inspector_id, NOW() - INTERVAL '4 days', 890.00, 'completed');
  UPDATE vehicles SET report_id = v_report_id WHERE id = v_vehicle_id;

  RAISE NOTICE 'Successfully added 20 vehicle examples!';
  RAISE NOTICE 'Brands: Citroën, Seat, Skoda, Volvo, Opel, Hyundai, Kia, Mazda, Honda, Fiat, Dacia, Mini, Alfa Romeo, Jeep, Suzuki, Mitsubishi, Land Rover, Tesla, Porsche, Lexus';

END $$;
