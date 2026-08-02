-- ============================================================
-- Backfill: fix graduation_year for theses.fr imports done before the
-- DD/MM/YYYY parsing bug fix (import-theses-fr/index.ts)
-- ============================================================
-- The old parseInt(dateSoutenance.slice(0, 4)) read "15/1" out of
-- "15/12/2020" instead of the year, silently storing garbage. Every
-- theses.fr NNT (external_id) starts with the actual defense year by
-- construction (France's "Numéro National de Thèse" format) — confirmed
-- live against theses.fr for several NNTs, each matching its own
-- dateSoutenance year exactly (e.g. "2020NORMR090" ↔ "15/12/2020"). That
-- makes external_id a reliable source to recompute from, no re-fetch needed.
UPDATE public.theses
SET graduation_year = substring(external_id from 1 for 4)::int
WHERE origin = 'theses_fr'
  AND external_id ~ '^[0-9]{4}'
  AND (graduation_year IS NULL OR graduation_year < 1900 OR graduation_year > 2100);
