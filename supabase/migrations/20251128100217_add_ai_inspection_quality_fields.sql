/*
  # Add AI Inspection Quality Fields

  1. New Columns
    - `image_quality` (text) - Quality of images used for AI inspection
      - Values: 'good', 'acceptable', 'bad', 'none'
    - `ai_inspection_status` (text) - Overall AI inspection status
      - Values: 'worked', 'light_issue', 'did_not_work', 'none'
  
  2. Changes
    - Add these fields to track Tchek.ai inspection quality metrics
    - These help users understand the reliability of AI-generated inspection results
*/

-- Add image quality field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_reports' AND column_name = 'image_quality'
  ) THEN
    ALTER TABLE inspection_reports 
    ADD COLUMN image_quality text DEFAULT 'none' CHECK (image_quality IN ('good', 'acceptable', 'bad', 'none'));
  END IF;
END $$;

-- Add AI inspection status field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_reports' AND column_name = 'ai_inspection_status'
  ) THEN
    ALTER TABLE inspection_reports 
    ADD COLUMN ai_inspection_status text DEFAULT 'none' CHECK (ai_inspection_status IN ('worked', 'light_issue', 'did_not_work', 'none'));
  END IF;
END $$;
