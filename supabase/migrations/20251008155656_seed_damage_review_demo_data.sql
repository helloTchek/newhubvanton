/*
  # Seed Demo Data for Damage Review

  ## Overview
  This migration seeds the database with demo data for testing the damage review feature.
  
  ## Data Created
  
  1. **Vehicle**
     - Renault Clio 2021 for AutoCorp Solutions
     - Registration: AB-123-CD
  
  2. **Inspection Report**
     - Complete inspection report with proper IDs
     - Links to the demo vehicle and current user
  
  3. **Damage Images**
     - Sample images for car body section (Front Bumper)
     - Uses publicly available placeholder images
  
  4. **Damages**
     - Multiple sample damages with different statuses
     - Includes bounding boxes and severity levels
     - Some pending review, some validated, some marked as false positives
  
  ## Notes
  - All UUIDs are deterministic for easy reference
  - Images use Pexels placeholder URLs
  - Data respects RLS policies through proper company associations
*/

-- Get the current user and company IDs
DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid := '11111111-1111-1111-1111-111111111111';
  v_vehicle_id uuid := '22222222-2222-2222-2222-222222222222';
  v_report_id uuid := '33333333-3333-3333-3333-333333333333';
  v_image_id_1 uuid := '44444444-4444-4444-4444-444444444444';
  v_image_id_2 uuid := '55555555-5555-5555-5555-555555555555';
  v_image_id_3 uuid := '66666666-6666-6666-6666-666666666666';
BEGIN
  -- Get the first user (should be the current logged in user)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Create vehicle if it doesn't exist
  INSERT INTO vehicles (
    id, registration, make, model, year, mileage, company_id, 
    status, estimated_value, estimated_cost, image_url, customer_email
  )
  VALUES (
    v_vehicle_id,
    'AB-123-CD',
    'Renault',
    'Clio',
    2021,
    25000,
    v_company_id,
    'to_review',
    18500,
    1200,
    'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=400',
    'john.doe@autocorp.com'
  )
  ON CONFLICT (id) DO UPDATE SET
    status = 'to_review',
    updated_at = now();
  
  -- Create inspection report
  INSERT INTO inspection_reports (
    id, vehicle_id, tchek_id, inspector_id, report_date, photos_date,
    total_cost, report_status
  )
  VALUES (
    v_report_id,
    v_vehicle_id,
    'TCK-2024-001',
    v_user_id,
    now() - interval '2 days',
    now() - interval '2 days',
    1200,
    'completed'
  )
  ON CONFLICT (id) DO UPDATE SET
    report_status = 'completed',
    updated_at = now();
  
  -- Create damage images for the front bumper
  INSERT INTO damage_images (
    id, report_id, section_id, part_name, image_url, image_type, order_index
  )
  VALUES 
    (
      v_image_id_1,
      v_report_id,
      'section-body',
      'Front Bumper',
      'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
      'damage',
      0
    ),
    (
      v_image_id_2,
      v_report_id,
      'section-body',
      'Front Bumper',
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      'damage',
      1
    ),
    (
      v_image_id_3,
      v_report_id,
      'section-body',
      'Rear Bumper',
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'damage',
      0
    )
  ON CONFLICT (id) DO UPDATE SET
    image_url = EXCLUDED.image_url,
    order_index = EXCLUDED.order_index;
  
  -- Create sample damages
  INSERT INTO damages (
    id, report_id, image_id, section_id, part_name, location, damage_type,
    severity, status, bounding_box, confidence_score, notes
  )
  VALUES
    -- Pending damages on first image
    (
      '77777777-7777-7777-7777-777777777777',
      v_report_id,
      v_image_id_1,
      'section-body',
      'Front Bumper',
      'Center',
      'Scratch',
      2,
      'pending',
      '{"x": 120, "y": 150, "width": 80, "height": 60}'::jsonb,
      0.92,
      'Detected by AI - needs human review'
    ),
    (
      '88888888-8888-8888-8888-888888888888',
      v_report_id,
      v_image_id_1,
      'section-body',
      'Front Bumper',
      'Bottom Left',
      'Dent',
      3,
      'pending',
      '{"x": 50, "y": 220, "width": 100, "height": 80}'::jsonb,
      0.87,
      'Possible impact damage'
    ),
    -- Validated damage on second image
    (
      '99999999-9999-9999-9999-999999999999',
      v_report_id,
      v_image_id_2,
      'section-body',
      'Front Bumper',
      'Right Side',
      'Paint Chip',
      1,
      'validated',
      '{"x": 250, "y": 180, "width": 40, "height": 30}'::jsonb,
      0.95,
      'Confirmed minor paint damage'
    ),
    -- False positive on second image
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      v_report_id,
      v_image_id_2,
      'section-body',
      'Front Bumper',
      'Top',
      'Scratch',
      1,
      'false_positive',
      '{"x": 200, "y": 80, "width": 50, "height": 20}'::jsonb,
      0.65,
      'Shadow misidentified as damage'
    ),
    -- Damages on rear bumper
    (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      v_report_id,
      v_image_id_3,
      'section-body',
      'Rear Bumper',
      'Center',
      'Dent',
      4,
      'pending',
      '{"x": 160, "y": 170, "width": 120, "height": 90}'::jsonb,
      0.94,
      'Significant rear impact damage'
    ),
    (
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      v_report_id,
      v_image_id_3,
      'section-body',
      'Rear Bumper',
      'Bottom',
      'Scratch',
      2,
      'pending',
      '{"x": 140, "y": 240, "width": 70, "height": 40}'::jsonb,
      0.88,
      'Scrape along bottom edge'
    )
  ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    notes = EXCLUDED.notes,
    updated_at = now();
  
  RAISE NOTICE 'Demo data seeded successfully!';
  RAISE NOTICE 'Vehicle ID: %', v_vehicle_id;
  RAISE NOTICE 'Report ID: %', v_report_id;
  RAISE NOTICE 'Access damage review at: /damage-review/%', v_report_id;
END $$;
