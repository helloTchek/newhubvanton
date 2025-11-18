/*
  # Add Preferred Language Field to User Profiles

  1. Changes
    - Add `preferred_language` column to `user_profiles` table
    - Default value is 'en' (English)
    - Column stores ISO 639-1 language codes (2 characters)

  2. Supported Languages
    - EN (English)
    - FR (French)
    - DE (German)
    - IT (Italian)
    - ES (Spanish)
    - NL (Dutch)
    - SV (Swedish)
    - NO (Norwegian)

  3. Notes
    - This field enables per-user language preferences
    - Used by the LanguageSwitcher component
    - Stored in user_profiles for easy access with user data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN preferred_language VARCHAR(2) DEFAULT 'en';
    
    CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_language 
    ON user_profiles(preferred_language);
  END IF;
END $$;
