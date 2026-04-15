-- Migration: 0002_profiles_trigger.sql
-- Optional trigger to create profile on auth.users insert
-- NOTE: This project uses a server action for profile creation (with username collection).
-- This trigger serves as a fallback for edge cases (e.g., OAuth providers in the future).
-- It requires a username to be provided in raw_user_meta_data during signup.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if username is provided in metadata (server action handles the normal case)
  IF NEW.raw_user_meta_data ->> 'username' IS NOT NULL THEN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
