-- Let admins edit author_name directly (e.g. fixing a display-name typo or
-- an author-swap during moderation), without loosening the protection for
-- everyone else: set_thesis_author_name_trigger still unconditionally
-- re-derives author_name from the submitter's profile for non-admins, so a
-- non-admin owner can't spoof it via a direct API call either.
--
-- On submit-thesis's own INSERT path, auth.uid() has no JWT context (it
-- runs on the service-role key directly), so is_admin(auth.uid()) is
-- false there regardless — this migration doesn't change submission
-- behavior, only what an admin can do via an UPDATE ... SET author_name.
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
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

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
