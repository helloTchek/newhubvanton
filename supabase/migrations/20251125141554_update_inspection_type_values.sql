/*
  # Update Inspection Type Values

  1. Changes
    - Update inspection_type column to support new values:
      - 'api' (existing)
      - 'manual_upload' (existing)
      - 'remote_inspection' (new - replaces 'webapp')
      - 'onsite_inspection' (new)
    
  2. Data Migration
    - Convert existing 'webapp' values to 'remote_inspection'
    
  3. Notes
    - This maintains backward compatibility by migrating old data
    - The column remains as text type for flexibility
*/

-- First, update any existing 'webapp' values to 'remote_inspection'
UPDATE vehicles 
SET inspection_type = 'remote_inspection' 
WHERE inspection_type = 'webapp';

-- Add a comment to document the valid values
COMMENT ON COLUMN vehicles.inspection_type IS 'Type of inspection: api, manual_upload, remote_inspection, onsite_inspection';
