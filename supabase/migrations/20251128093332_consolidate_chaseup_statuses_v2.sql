/*
  # Consolidate Chase-Up Statuses

  1. Changes
    - Migrate all chase-up status variations to single 'chased_up' status
    - Update vehicles table constraint to use new status values
    - Convert existing data: chased_up_1, chased_up_2, chased_up_manual → chased_up
  
  2. Migration Steps
    - Drop old constraint first
    - Update all existing vehicles with chase-up statuses to 'chased_up'
    - Create new constraint with consolidated statuses
*/

-- Drop the old constraint first
ALTER TABLE vehicles 
DROP CONSTRAINT IF EXISTS vehicles_status_check;

-- Update all existing chase-up statuses to the new single status
UPDATE vehicles 
SET status = 'chased_up' 
WHERE status IN ('chased_up_1', 'chased_up_2', 'chased_up_manual');

-- Add new constraint with consolidated statuses
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('link_sent', 'chased_up', 'inspection_in_progress', 'inspected', 'to_review', 'archived'));
