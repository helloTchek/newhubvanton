/*
  # Update Vehicle Status Constraint

  1. Changes
    - Drop old constraint that only allowed: inspection_in_progress, inspected, to_review
    - Add new constraint that allows all valid vehicle statuses:
      - link_sent: Inspection link has been sent to customer
      - chased_up_1: First follow-up reminder sent
      - chased_up_2: Second follow-up reminder sent
      - chased_up_manual: Manual follow-up required
      - inspection_in_progress: Customer is currently performing inspection
      - inspected: Inspection completed
      - to_review: Requires manual review
      - archived: Vehicle archived

  2. Notes
    - This aligns the constraint with the actual workflow statuses used in the application
*/

-- Drop old constraint
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;

-- Add new constraint with all valid statuses
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