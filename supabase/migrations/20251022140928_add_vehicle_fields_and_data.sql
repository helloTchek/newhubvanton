/*
  # Update Vehicles to Inspected Status
  
  Updates vehicles with damage data to 'inspected' status and creates missing inspection reports.
*/

DO $$
DECLARE
  v_mercedes_id uuid := '99999999-9999-9999-9999-999999999999';
  v_renault_id uuid := '22222222-2222-2222-2222-222222222222';
  v_report_id uuid;
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM user_profiles LIMIT 1;
  
  IF v_user_id IS NULL THEN
    v_user_id := '20142610-125b-49af-aaf7-c94e0d2131c7';
  END IF;
  
  -- Update Renault Clio to inspected status
  UPDATE vehicles 
  SET status = 'inspected',
      inspection_date = NOW() - INTERVAL '3 days'
  WHERE id = v_renault_id;
  
  RAISE NOTICE 'Updated Renault Clio to inspected status';
  
  -- Check if Mercedes already has a report
  SELECT ir.id INTO v_report_id
  FROM inspection_reports ir
  WHERE ir.vehicle_id = v_mercedes_id;
  
  IF v_report_id IS NULL THEN
    v_report_id := gen_random_uuid();
    
    INSERT INTO inspection_reports (
      id, vehicle_id, inspector_id, tchek_id, 
      report_date, report_status, total_cost
    ) VALUES (
      v_report_id,
      v_mercedes_id,
      v_user_id,
      'MERC-' || SUBSTRING(v_report_id::text, 1, 8),
      NOW() - INTERVAL '1 day',
      'completed',
      0
    );
    
    RAISE NOTICE 'Created inspection report for Mercedes C-Class: %', v_report_id;
  END IF;
  
END $$;
