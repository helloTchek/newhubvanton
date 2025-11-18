/*
  # Update vehicle status constraint

  1. Changes
    - Drop old status check constraint
    - Add new constraint with all valid statuses including:
      - link_sent
      - chased_up_1
      - chased_up_2
      - chased_up_manual
      - inspection_in_progress
      - inspected
      - to_review
      - archived

  2. Notes
    - Allows the full workflow of vehicle inspection statuses
*/

-- Drop the old constraint
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;

-- Add the new constraint with all valid statuses
ALTER TABLE vehicles ADD CONSTRAINT vehicles_status_check 
CHECK (status IN (
  'link_sent',
  'chased_up_1',
  'chased_up_2',
  'chased_up_manual',
  'inspection_in_progress',
  'inspected',
  'to_review',
  'archived'
));