-- ============================================================
-- SEC-03: close the author-name spoof reopened by the theses.fr import bypass
-- ============================================================
-- 20260802100000_theses_fr_import_support.sql added:
--   IF NEW.origin = 'theses_fr' THEN RETURN NEW; END IF;
-- to skip re-deriving author_name from the submitter's profile — necessary
-- for theses.fr imports, which have no HexBiblio profile to derive a name
-- from. But that check only looks at the *value* of origin, not who set it.
-- "Users can update own theses" (20260413224509) has no column restriction,
-- so any authenticated owner can do:
--   UPDATE theses SET origin = 'theses_fr', author_name = 'anything' WHERE id = <their own thesis>;
-- and the trigger — seeing origin = 'theses_fr' — waves the spoofed name
-- through untouched. That's the exact vulnerability the original author lock
-- (20260730120000) existed to close, reopened via a value any owner already
-- controls on their own row.
--
-- Fix: the bypass must also require there being no authenticated caller at
-- all (auth.uid() IS NULL), which is only true for service-role calls with
-- no user JWT — confirmed import-theses-fr's Supabase client is constructed
-- with the service-role key and never forwards a caller JWT, so this doesn't
-- change that legitimate path at all. A real client UPDATE always carries
-- the caller's own JWT, so auth.uid() is never NULL there, and the bypass
-- can no longer be reached by setting origin alone.
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
  IF NEW.origin = 'theses_fr' AND auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

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
