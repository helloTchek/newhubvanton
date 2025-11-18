/*
  # Add chased_up_manual status

  1. Changes
    - Adds new 'chased_up_manual' status to vehicle inspection workflow
    - This status indicates when a manual chase-up (email or SMS) has been sent
    - Positioned between automated chase-ups and inspection in progress

  2. Notes
    - Status will be set automatically when chase-ups are sent via:
      - Individual vehicle chase-up modal
      - Bulk chase-up functionality
    - Allows tracking of manual intervention in the inspection workflow
*/

-- The vehicles table uses text for status, so no ALTER TYPE needed
-- The new status 'chased_up_manual' can be used immediately