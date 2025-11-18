/*
  # Seed Default Theme Configuration

  1. Purpose
    - Create a default theme configuration for demo purposes
    - This shows how white-label theming works
    
  2. Changes
    - Insert default theme with standard blue/green color scheme
    - This can be customized per company in production
*/

DO $$
DECLARE
  default_company_id uuid;
  first_user_id uuid;
BEGIN
  SELECT id INTO default_company_id FROM companies LIMIT 1;
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF default_company_id IS NOT NULL AND first_user_id IS NOT NULL THEN
    INSERT INTO theme_configurations (
      company_id,
      logo_url,
      primary_color,
      accent_color,
      dominant_color,
      text_primary_color,
      background_primary_color,
      is_active,
      created_by
    )
    VALUES (
      default_company_id,
      '',
      '#3B82F6',
      '#10B981',
      '#1F2937',
      '#111827',
      '#FFFFFF',
      true,
      first_user_id
    )
    ON CONFLICT (company_id, is_active) DO NOTHING;
  END IF;
END $$;
