/*
  # Fix Section IDs for Damage Review Compatibility

  Updates section IDs in damages and damage_images tables to match the expected format
  used by the damage review page (section-body, section-interior, etc.)
  
  Mapping:
  - carbody -> section-body
  - cabin -> section-interior
  - glass -> section-glass
  - dashboard -> section-motor (dashboard warnings are technical/motor issues)
  - declaration -> section-documents
*/

-- Update damage_images section IDs
UPDATE damage_images SET section_id = 'section-body' WHERE section_id = 'carbody';
UPDATE damage_images SET section_id = 'section-interior' WHERE section_id = 'cabin';
UPDATE damage_images SET section_id = 'section-glass' WHERE section_id = 'glass';
UPDATE damage_images SET section_id = 'section-motor' WHERE section_id = 'dashboard';
UPDATE damage_images SET section_id = 'section-documents' WHERE section_id = 'declaration';

-- Update damages section IDs
UPDATE damages SET section_id = 'section-body' WHERE section_id = 'carbody';
UPDATE damages SET section_id = 'section-interior' WHERE section_id = 'cabin';
UPDATE damages SET section_id = 'section-glass' WHERE section_id = 'glass';
UPDATE damages SET section_id = 'section-motor' WHERE section_id = 'dashboard';
UPDATE damages SET section_id = 'section-documents' WHERE section_id = 'declaration';
