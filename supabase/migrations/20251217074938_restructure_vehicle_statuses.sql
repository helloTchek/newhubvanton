/*
  # Restructure Vehicle Statuses and Add Action Tags

  ## Overview
  This migration restructures the vehicle status system to use four main statuses
  and converts "chased_up" to a tag system with action tags.

  ## Changes

  1. Status Restructuring
     - Old: 'link_sent', 'chased_up', 'inspection_in_progress', 'inspected', 'to_review', 'archived'
     - New: 'created', 'in_progress', 'in_review', 'completed', 'archived'
     - Migration mapping:
       - 'link_sent' → 'created'
       - 'chased_up' → 'created' (with "Chased-up" tag)
       - 'inspection_in_progress' → 'in_progress'
       - 'inspected' → 'completed'
       - 'to_review' → 'in_review'
       - 'archived' → 'archived'

  2. System Tags
     - Create "Chased-up" tag (orange color) for tracking follow-ups
     - Create "To review" tag (blue color) for marking items needing review

  3. Data Migration
     - Update all existing vehicle statuses to new values
     - Add "Chased-up" tag to vehicles that had 'chased_up' status
     - Keep archived status tracking intact

  ## Security
     - Maintains existing RLS policies
     - No permission changes required
*/

-- Step 1: Create system tags if they don't exist
DO $$
DECLARE
  v_chased_up_tag_id uuid;
  v_to_review_tag_id uuid;
BEGIN
  -- Create "Chased-up" tag
  INSERT INTO tags (id, name, color, created_at)
  VALUES (
    gen_random_uuid(),
    'Chased-up',
    '#F97316',
    now()
  )
  ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color
  RETURNING id INTO v_chased_up_tag_id;

  -- Get the chased-up tag ID if it already existed
  IF v_chased_up_tag_id IS NULL THEN
    SELECT id INTO v_chased_up_tag_id FROM tags WHERE name = 'Chased-up';
  END IF;

  -- Create "To review" tag
  INSERT INTO tags (id, name, color, created_at)
  VALUES (
    gen_random_uuid(),
    'To review',
    '#3B82F6',
    now()
  )
  ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color
  RETURNING id INTO v_to_review_tag_id;

  -- Get the to review tag ID if it already existed
  IF v_to_review_tag_id IS NULL THEN
    SELECT id INTO v_to_review_tag_id FROM tags WHERE name = 'To review';
  END IF;

  -- Add "Chased-up" tag to all vehicles with 'chased_up' status
  INSERT INTO vehicle_tags (vehicle_id, tag_id, created_at)
  SELECT v.id, v_chased_up_tag_id, now()
  FROM vehicles v
  WHERE v.status = 'chased_up'
    AND NOT EXISTS (
      SELECT 1 FROM vehicle_tags vt
      WHERE vt.vehicle_id = v.id AND vt.tag_id = v_chased_up_tag_id
    );
END $$;

-- Step 2: Drop the old status constraint
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;

-- Step 3: Update all vehicle statuses to new values
UPDATE vehicles SET status = 'created' WHERE status = 'link_sent';
UPDATE vehicles SET status = 'created' WHERE status = 'chased_up';
UPDATE vehicles SET status = 'in_progress' WHERE status = 'inspection_in_progress';
UPDATE vehicles SET status = 'completed' WHERE status = 'inspected';
UPDATE vehicles SET status = 'in_review' WHERE status = 'to_review';

-- Step 4: Update status_before_archive if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'status_before_archive'
  ) THEN
    UPDATE vehicles SET status_before_archive = 'created' WHERE status_before_archive = 'link_sent';
    UPDATE vehicles SET status_before_archive = 'created' WHERE status_before_archive = 'chased_up';
    UPDATE vehicles SET status_before_archive = 'in_progress' WHERE status_before_archive = 'inspection_in_progress';
    UPDATE vehicles SET status_before_archive = 'completed' WHERE status_before_archive = 'inspected';
    UPDATE vehicles SET status_before_archive = 'in_review' WHERE status_before_archive = 'to_review';
  END IF;
END $$;

-- Step 5: Add the new status constraint
ALTER TABLE vehicles ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('created', 'in_progress', 'in_review', 'completed', 'archived'));

-- Step 6: Update default status value
ALTER TABLE vehicles ALTER COLUMN status SET DEFAULT 'in_progress';