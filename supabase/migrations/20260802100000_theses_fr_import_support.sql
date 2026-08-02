-- Support for seeding the sources corpus from theses.fr (the open national
-- doctoral thesis registry, doctorate-only) to solve cold-start on
-- "les incontournables" and "mémoires proches" before a field has enough
-- real student submissions. Imported rows are a backing corpus for those two
-- features ONLY for now — deliberately kept out of /database and /sources
-- ("Toutes les sources") until there's a decision on whether/how to surface
-- them as browsable content (they have no consenting HexBiblio contributor
-- behind them).

ALTER TABLE public.theses
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'community'
    CHECK (origin IN ('community', 'theses_fr')),
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT;

COMMENT ON COLUMN public.theses.external_id IS 'theses.fr NNT (numéro national de thèse) — dedup key for re-running the import.';
COMMENT ON COLUMN public.theses.external_url IS 'Canonical theses.fr record URL, kept for attribution back to the source (Licence Ouverte).';

-- Partial + unique so community rows (external_id always NULL) never collide
-- with each other, and re-running the import can cheaply skip what's already in.
CREATE UNIQUE INDEX IF NOT EXISTS theses_external_id_unique_idx
  ON public.theses (external_id) WHERE external_id IS NOT NULL;

-- Imported rows carry their real theses.fr author name directly, supplied at
-- insert time — there is no HexBiblio profile behind them to derive one from,
-- and routing them through a placeholder system account would misattribute
-- every imported thesis to that same fake name. Same escape-hatch shape as
-- the existing is_admin() bypass in this trigger (20260801000000), just keyed
-- on origin instead of caller identity.
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
  IF NEW.origin = 'theses_fr' THEN
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
