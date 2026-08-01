-- ============================================================
-- "Mémoires proches par sources partagées" — cross-thesis discovery
-- ============================================================
-- Given a thesis, finds other theses that cite overlapping references — a
-- second way to exploit the sources table as a corpus (the first being
-- get_field_essentials). Neither ranking exists in any single PDF: reading
-- one thesis tells you nothing about what other theses cite, you'd have to
-- open every other document and cross-reference by hand.
--
-- Reuses normalize_citation_title() from the 20260801120000 migration —
-- same grouping key, same reasoning (title is the only stable identifier
-- the AI parse produces; author/year formatting drifts too much).
CREATE OR REPLACE FUNCTION public.get_related_theses(
  _thesis_id uuid,
  _limit integer DEFAULT 5,
  _min_shared integer DEFAULT 2
)
RETURNS TABLE (
  thesis_id uuid,
  title text,
  author_name text,
  field text,
  degree_type text,
  shared_sources bigint
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH target_keys AS (
    -- Distinct: this thesis citing the same work twice must count as one
    -- point of overlap with another thesis, not two.
    SELECT DISTINCT public.normalize_citation_title(s.title) AS key
    FROM public.sources s
    WHERE s.thesis_id = _thesis_id
      AND s.title IS NOT NULL
      AND length(public.normalize_citation_title(s.title)) >= 8
  ),
  other_keys AS (
    SELECT DISTINCT s.thesis_id, public.normalize_citation_title(s.title) AS key
    FROM public.sources s
    WHERE s.thesis_id != _thesis_id
      AND s.title IS NOT NULL
      AND length(public.normalize_citation_title(s.title)) >= 8
  )
  SELECT
    t.id AS thesis_id,
    t.title,
    t.author_name,
    t.field,
    t.degree_type,
    COUNT(*) AS shared_sources
  FROM other_keys ok
  JOIN target_keys tk ON tk.key = ok.key
  JOIN public.theses t ON t.id = ok.thesis_id
  GROUP BY t.id, t.title, t.author_name, t.field, t.degree_type
  HAVING COUNT(*) >= GREATEST(_min_shared, 1)
  ORDER BY COUNT(*) DESC, t.title ASC
  LIMIT GREATEST(LEAST(_limit, 20), 1);
$$;
