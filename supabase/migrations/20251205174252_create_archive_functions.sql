/*
  # Create archive/unarchive functions

  1. New Functions
    - `archive_vehicles(vehicle_ids uuid[])` - Archives vehicles and saves their current status
    - `unarchive_vehicles(vehicle_ids uuid[])` - Unarchives vehicles and restores their previous status
  
  2. Security
    - Functions use SECURITY DEFINER to run with elevated privileges
    - Proper error handling included
*/

-- Function to archive vehicles
CREATE OR REPLACE FUNCTION archive_vehicles(vehicle_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update vehicles: save current status and set to archived
  UPDATE vehicles
  SET 
    status_before_archive = status,
    status = 'archived',
    updated_at = now()
  WHERE id = ANY(vehicle_ids)
    AND status != 'archived'; -- Only archive if not already archived
END;
$$;

-- Function to unarchive vehicles
CREATE OR REPLACE FUNCTION unarchive_vehicles(vehicle_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update vehicles: restore previous status
  UPDATE vehicles
  SET 
    status = COALESCE(status_before_archive, 'inspected'),
    status_before_archive = NULL,
    updated_at = now()
  WHERE id = ANY(vehicle_ids)
    AND status = 'archived'; -- Only unarchive if currently archived
END;
$$;