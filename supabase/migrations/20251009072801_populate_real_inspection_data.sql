/*
  # Populate Real Inspection Data

  ## Overview
  This migration populates the database with real inspection data from DataApi JSON report (data 80).
  Part names are mapped using the 2025+2026 nomenclature file.
  
  ## Data Source
  - Inspection Report ID: data (80).json
  - Total Parts with Damages: 7
  - Total Individual Damages: 17
  - Unique Images: 7
  
  ## Parts Included
  1. **Aluminum rim Rear Right** (JNAARD) - Scratched, Severity 3, 1 damage
  2. **Aluminum rim Rear Left** (JNAARG) - Scratched, Severity 3, 1 damage
  3. **Bumper Rear** (PRCAR) - Damaged, Severity 4, 6 damages
  4. **Aluminum rim Front Right** (JNAAVD) - Scratched, Severity 3, 1 damage
  5. **Side mirror Left** (RTRG) - Scratched, Severity 3, 1 damage
  6. **Door Front Left** (PRTAVG) - Damaged, Severity 4, 6 damages
  7. **Underbody Right** (BDCD) - Scratched, Severity 3, 1 damage
  
  ## Database Updates
  - Clears existing demo data from previous migration
  - Creates damage_images entries with real S3 URLs
  - Creates damages entries with actual bounding boxes and confidence scores
  - All damages set to 'pending' status for review
*/

DO $$
DECLARE
  v_report_id uuid := '33333333-3333-3333-3333-333333333333';
  v_user_id uuid;
  
  -- Image IDs (deterministic UUIDs)
  v_img_rear_right_rim uuid := 'a0000000-0000-0000-0000-000000000001';
  v_img_rear_left_rim uuid := 'a0000000-0000-0000-0000-000000000002';
  v_img_rear_bumper_1 uuid := 'a0000000-0000-0000-0000-000000000003';
  v_img_rear_bumper_2 uuid := 'a0000000-0000-0000-0000-000000000004';
  v_img_rear_bumper_3 uuid := 'a0000000-0000-0000-0000-000000000005';
  v_img_front_right_rim uuid := 'a0000000-0000-0000-0000-000000000006';
  v_img_side_mirror uuid := 'a0000000-0000-0000-0000-000000000007';
  v_img_front_door uuid := 'a0000000-0000-0000-0000-000000000008';
  v_img_underbody uuid := 'a0000000-0000-0000-0000-000000000009';
  
BEGIN
  -- Get current user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Clear existing demo data for this report
  DELETE FROM damages WHERE report_id = v_report_id;
  DELETE FROM damage_images WHERE report_id = v_report_id;
  
  RAISE NOTICE 'Creating damage images from real inspection data...';
  
  -- Insert damage images
  INSERT INTO damage_images (id, report_id, section_id, part_name, image_url, image_type, order_index) VALUES
    -- Rear Right Rim
    (v_img_rear_right_rim, v_report_id, 'section-rim', 'Aluminum rim Rear Right', 
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/backT34Driver.jpeg', 'damage', 0),
    
    -- Rear Left Rim  
    (v_img_rear_left_rim, v_report_id, 'section-rim', 'Aluminum rim Rear Left',
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/sideDriver.jpeg', 'damage', 0),
    
    -- Rear Bumper (multiple images)
    (v_img_rear_bumper_1, v_report_id, 'section-body', 'Bumper Rear',
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/back.jpeg', 'damage', 0),
    (v_img_rear_bumper_2, v_report_id, 'section-body', 'Bumper Rear',
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/backT34Driver.jpeg', 'damage', 1),
    (v_img_rear_bumper_3, v_report_id, 'section-body', 'Bumper Rear',
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/backT34Passenger.jpeg', 'damage', 2),
    
    -- Front Right Rim
    (v_img_front_right_rim, v_report_id, 'section-rim', 'Aluminum rim Front Right',
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/sidePassengerFrontInspect.jpeg', 'damage', 0),
    
    -- Side Mirror Left
    (v_img_side_mirror, v_report_id, 'section-body', 'Side mirror Left',
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/sideDriverFrontInspect.jpeg', 'damage', 0),
    
    -- Front Door Left
    (v_img_front_door, v_report_id, 'section-body', 'Door Front Left',
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/sideDriver.jpeg', 'damage', 0),
    
    -- Underbody Right
    (v_img_underbody, v_report_id, 'section-body', 'Underbody Right',
     'https://tchekprod-b257.s3.eu-central-1.amazonaws.com/ooH7iAfgsD/p8VHcTgySE/sidePassengerFrontInspect.jpeg', 'damage', 0)
  ON CONFLICT (id) DO UPDATE SET
    image_url = EXCLUDED.image_url,
    part_name = EXCLUDED.part_name;
  
  RAISE NOTICE 'Creating damages from real inspection data...';
  
  -- Insert damages with real bounding boxes and confidence scores
  INSERT INTO damages (
    report_id, image_id, section_id, part_name, location, damage_type,
    severity, status, bounding_box, confidence_score, notes
  ) VALUES
    -- Rear Right Rim - Scratch
    (v_report_id, v_img_rear_right_rim, 'section-rim', 'Aluminum rim Rear Right', 'Center',
     'Scratch', 3, 'pending', '{"x": 666, "y": 727, "width": 204, "height": 346}'::jsonb, 0.43,
     'AI-detected rim scratch - requires validation'),
    
    -- Rear Left Rim - Scratch
    (v_report_id, v_img_rear_left_rim, 'section-rim', 'Aluminum rim Rear Left', 'Right Side',
     'Scratch', 3, 'pending', '{"x": 1591, "y": 712, "width": 168, "height": 107}'::jsonb, 0.44,
     'AI-detected rim scratch - requires validation'),
    
    -- Rear Bumper - Multiple damages
    (v_report_id, v_img_rear_bumper_1, 'section-body', 'Bumper Rear', 'Left Side',
     'Scratch', 3, 'pending', '{"x": 374, "y": 1007, "width": 120, "height": 42}'::jsonb, 0.54,
     'Horizontal scratch on rear bumper'),
    (v_report_id, v_img_rear_bumper_1, 'section-body', 'Bumper Rear', 'Left Side',
     'Dent', 4, 'pending', '{"x": 446, "y": 1007, "width": 48, "height": 32}'::jsonb, 0.18,
     'Small dent near scratch - low confidence'),
    (v_report_id, v_img_rear_bumper_1, 'section-body', 'Bumper Rear', 'Center',
     'Chip', 3, 'pending', '{"x": 272, "y": 798, "width": 26, "height": 22}'::jsonb, 0.46,
     'Paint chip on bumper'),
    (v_report_id, v_img_rear_bumper_2, 'section-body', 'Bumper Rear', 'Right Side',
     'Scratch', 3, 'pending', '{"x": 1368, "y": 853, "width": 59, "height": 23}'::jsonb, 0.50,
     'Minor scratch visible from angle'),
    (v_report_id, v_img_rear_bumper_2, 'section-body', 'Bumper Rear', 'Right Side',
     'Scratch', 3, 'pending', '{"x": 1515, "y": 951, "width": 53, "height": 37}'::jsonb, 0.51,
     'Additional scratch on right side'),
    (v_report_id, v_img_rear_bumper_3, 'section-body', 'Bumper Rear', 'Center',
     'Scratch', 3, 'pending', '{"x": 699, "y": 913, "width": 23, "height": 24}'::jsonb, 0.40,
     'Small surface scratch'),
    
    -- Front Right Rim - Scratch
    (v_report_id, v_img_front_right_rim, 'section-rim', 'Aluminum rim Front Right', 'Lower Right',
     'Scratch', 3, 'pending', '{"x": 1234, "y": 820, "width": 174, "height": 168}'::jsonb, 0.73,
     'Significant rim damage - high confidence detection'),
    
    -- Side Mirror Left - Scratch
    (v_report_id, v_img_side_mirror, 'section-body', 'Side mirror Left', 'Upper',
     'Scratch', 3, 'pending', '{"x": 1001, "y": 400, "width": 48, "height": 53}'::jsonb, 0.49,
     'Scratch on mirror housing'),
    
    -- Front Door Left - Multiple damages
    (v_report_id, v_img_front_door, 'section-body', 'Door Front Left', 'Center',
     'Scratch', 3, 'pending', '{"x": 945, "y": 748, "width": 145, "height": 33}'::jsonb, 0.23,
     'Long horizontal scratch'),
    (v_report_id, v_img_front_door, 'section-body', 'Door Front Left', 'Upper Center',
     'Dent', 4, 'pending', '{"x": 902, "y": 732, "width": 35, "height": 36}'::jsonb, 0.25,
     'Small dent on door panel'),
    (v_report_id, v_img_front_door, 'section-body', 'Door Front Left', 'Lower Center',
     'Dent', 4, 'pending', '{"x": 1056, "y": 747, "width": 32, "height": 28}'::jsonb, 0.61,
     'Door panel dent - high confidence'),
    (v_report_id, v_img_side_mirror, 'section-body', 'Door Front Left', 'Lower Edge',
     'Dent', 4, 'pending', '{"x": 1528, "y": 839, "width": 32, "height": 33}'::jsonb, 0.39,
     'Door edge dent'),
    (v_report_id, v_img_side_mirror, 'section-body', 'Door Front Left', 'Lower Edge',
     'Scratch', 3, 'pending', '{"x": 1528, "y": 839, "width": 32, "height": 33}'::jsonb, 0.21,
     'Scratch at dent location'),
    (v_report_id, v_img_side_mirror, 'section-body', 'Door Front Left', 'Bottom',
     'Scratch', 3, 'pending', '{"x": 1476, "y": 895, "width": 85, "height": 23}'::jsonb, 0.52,
     'Scratch along door bottom'),
    
    -- Underbody Right - Scratch
    (v_report_id, v_img_underbody, 'section-body', 'Underbody Right', 'Lower',
     'Chip', 3, 'pending', '{"x": 615, "y": 875, "width": 232, "height": 65}'::jsonb, 0.28,
     'Paint chip on underbody - stone damage likely')
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Successfully populated database with real inspection data!';
  RAISE NOTICE 'Total images created: 9';
  RAISE NOTICE 'Total damages created: 17';
  RAISE NOTICE 'Report ID: %', v_report_id;
  RAISE NOTICE 'Access at: /damage-review/%', v_report_id;
  
END $$;
