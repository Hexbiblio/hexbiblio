-- Switch the thesis author-lock source from profiles.username to separate
-- first_name/last_name fields. username stays as-is (still used for
-- personalization, e.g. how thesis-chat addresses the student) — it's just
-- no longer the identity source for authorship.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Re-point the existing Phase 1 trigger function at first_name + last_name.
-- The trigger itself (set_thesis_author_name_trigger, created in
-- 20260730120000_lock_thesis_author_and_antispam.sql) already fires
-- BEFORE INSERT OR UPDATE OF author_name on public.theses and doesn't need
-- to be recreated — only the function body changes.
CREATE OR REPLACE FUNCTION public.set_thesis_author_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_first_name TEXT;
  profile_last_name TEXT;
BEGIN
  SELECT first_name, last_name INTO profile_first_name, profile_last_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  IF profile_first_name IS NULL OR trim(profile_first_name) = ''
     OR profile_last_name IS NULL OR trim(profile_last_name) = '' THEN
    RAISE EXCEPTION 'Complete your first and last name before submitting a thesis';
  END IF;

  NEW.author_name := trim(profile_first_name) || ' ' || trim(profile_last_name);
  RETURN NEW;
END;
$$;
