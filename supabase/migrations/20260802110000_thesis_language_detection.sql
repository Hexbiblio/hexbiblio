-- Language detection + title translation, applied to both new submissions/
-- imports and (via a dedicated backfill function, same shape as
-- extract-sources) theses already in the database. Title only, always
-- translated to French — HexBiblio is a French-first app — and only stored
-- when the detected language isn't already French; a null title_translated
-- means either "not yet processed" or "already French", distinguished by
-- checking detected_language.

ALTER TABLE public.theses
  ADD COLUMN IF NOT EXISTS detected_language TEXT,
  ADD COLUMN IF NOT EXISTS title_translated TEXT;

COMMENT ON COLUMN public.theses.detected_language IS 'ISO 639-3 code detected from title+abstract (see _shared/languageDetection.ts), e.g. "fra"/"eng"/"und". NULL = not yet processed.';
COMMENT ON COLUMN public.theses.title_translated IS 'French translation of the title, populated only when detected_language is not fr.';
