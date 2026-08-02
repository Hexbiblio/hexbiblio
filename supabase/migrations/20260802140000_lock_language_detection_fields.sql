-- ============================================================
-- DX-04: lock detected_language/title_translated against owner tampering
-- ============================================================
-- Same gap class as SEC-03, lower severity: these two columns (added by
-- 20260802110000_thesis_language_detection.sql) are populated by background
-- service-role UPDATEs (submit-thesis's post-response task, import-theses-fr,
-- the detect-thesis-language backfill) but were never added to
-- lock_immutable_thesis_fields_trigger's revert list — "Users can update own
-- theses" has no column restriction, so an owner could UPDATE their own row
-- and fake a "translated title" or claimed detected language. Not identity
-- spoofing (author_name stays protected by SEC-03's fix regardless), just an
-- integrity/cosmetic issue — a student could make the app display a title
-- translation that doesn't actually match the real title.
--
-- Same fix shape as SEC-03: the legitimate writers all use a service-role
-- client with no caller JWT, so auth.uid() IS NULL for them. Scoped to just
-- these two columns, not a blanket bypass on the whole function — the four
-- original fields keep reverting for literally everyone but admins,
-- service-role callers included, exactly as before this migration.
CREATE OR REPLACE FUNCTION public.lock_immutable_thesis_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  NEW.title := OLD.title;
  NEW.abstract := OLD.abstract;
  NEW.file_url := OLD.file_url;
  NEW.user_id := OLD.user_id;

  -- detected_language/title_translated only, not the four fields above:
  -- service-role background jobs (submit-thesis's post-response task,
  -- import-theses-fr, detect-thesis-language) legitimately UPDATE these two
  -- with no caller JWT, so auth.uid() IS NULL there and only there — a real
  -- client UPDATE always carries its own JWT, so this doesn't loosen
  -- protection on title/abstract/file_url/user_id at all.
  IF auth.uid() IS NOT NULL THEN
    NEW.detected_language := OLD.detected_language;
    NEW.title_translated := OLD.title_translated;
  END IF;

  RETURN NEW;
END;
$$;
