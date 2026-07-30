-- Phase 1 hardening: lock the thesis author identity to the submitter's
-- profile, and add basic anti-spam guards (min length + duplicate check).
-- Defense-in-depth: mirrors the client-side checks in SubmitThesis.tsx so a
-- direct API call (bypassing the UI) can't skip them either.

-- 1. Author identity lock ---------------------------------------------------
-- Re-derive author_name from the submitter's profile on every insert, and on
-- any update that touches author_name, instead of trusting client input.
-- SECURITY DEFINER so the trigger can read profiles regardless of its RLS.
CREATE OR REPLACE FUNCTION public.set_thesis_author_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_username TEXT;
BEGIN
  SELECT username INTO profile_username
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  IF profile_username IS NULL OR trim(profile_username) = '' THEN
    RAISE EXCEPTION 'Complete your profile username before submitting a thesis';
  END IF;

  NEW.author_name := profile_username;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_thesis_author_name_trigger ON public.theses;
CREATE TRIGGER set_thesis_author_name_trigger
  BEFORE INSERT OR UPDATE OF author_name ON public.theses
  FOR EACH ROW EXECUTE FUNCTION public.set_thesis_author_name();

-- 2. Basic anti-spam ---------------------------------------------------------
-- Minimum coherent length for title/abstract.
ALTER TABLE public.theses
  ADD CONSTRAINT theses_title_min_length CHECK (length(trim(title)) >= 5),
  ADD CONSTRAINT theses_abstract_min_length CHECK (length(trim(abstract)) >= 150);

-- Reject exact duplicate submissions (same title + author already in base),
-- case-insensitive and trim-insensitive.
CREATE UNIQUE INDEX IF NOT EXISTS theses_title_author_unique_idx
  ON public.theses (lower(btrim(title)), lower(btrim(author_name)));
