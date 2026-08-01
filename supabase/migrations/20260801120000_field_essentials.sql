-- ============================================================
-- "Les incontournables d'un domaine" — the works most students cite
-- ============================================================
-- Ranks the sources table by how many distinct theses cite each work, so a
-- student starting out in a field can see what everyone before them read.
-- All of this runs on data that already exists; nothing new is collected.

-- 1. Grouping key ----------------------------------------------------------
-- The same work cited in two theses never arrives as the same string: casing,
-- accents, trailing punctuation and spacing all vary, and the AI parse differs
-- slightly run to run. Titles are still by far the most stable identifier we
-- have — author formatting swings between "Bourdieu, P." and "Bourdieu, Pierre",
-- and years differ across editions of the same work — so normalized title is
-- the grouping key.
--
-- Accent folding is done with translate() rather than unaccent() on purpose:
-- it needs no extension (so this migration can't fail on a missing or
-- differently-schema'd unaccent) and, unlike unaccent(), it is genuinely
-- IMMUTABLE, so this function could back an index later if the table grows.
DROP FUNCTION IF EXISTS public.normalize_citation_title(text);
CREATE FUNCTION public.normalize_citation_title(_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT btrim(
    regexp_replace(
      translate(
        lower(_title),
        'áàâäãåéèêëíìîïóòôöõøúùûüçñ',
        'aaaaaaeeeeiiiioooooouuuucn'
      ),
      '\s+', ' ', 'g'
    ),
    ' .,;:''"«»()[]-'
  );
$$;

-- 2. The ranking -----------------------------------------------------------
-- SECURITY INVOKER (the default) on purpose: RLS still applies, and both
-- `sources` and `theses` are already readable by any authenticated user, so
-- this exposes nothing that a client couldn't already query itself — it just
-- does the aggregation in Postgres instead of shipping every row to the
-- browser to be counted there.
DROP FUNCTION IF EXISTS public.get_field_essentials(text, integer, integer);
CREATE FUNCTION public.get_field_essentials(
  _field text DEFAULT NULL,
  _limit integer DEFAULT 12,
  _min_theses integer DEFAULT 2
)
RETURNS TABLE (
  title text,
  authors text,
  year integer,
  thesis_count bigint,
  sample_citation text
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH cited AS (
    SELECT
      public.normalize_citation_title(s.title) AS key,
      s.title,
      s.authors,
      s.year,
      s.raw_citation,
      s.thesis_id
    FROM public.sources s
    JOIN public.theses t ON t.id = s.thesis_id
    WHERE s.title IS NOT NULL
      -- Very short "titles" are almost always a bad parse (a stray page
      -- number, a fragment of the previous entry), not a real work.
      AND length(public.normalize_citation_title(s.title)) >= 8
      AND (_field IS NULL OR t.field = _field)
  ),
  ranked AS (
    -- Counting distinct theses, not rows: "how many students cited this" is the
    -- question, and it stays honest if extraction ever emits the same entry
    -- twice within one bibliography.
    SELECT c.key, COUNT(DISTINCT c.thesis_id) AS thesis_count
    FROM cited c
    GROUP BY c.key
    HAVING COUNT(DISTINCT c.thesis_id) >= GREATEST(_min_theses, 1)
    ORDER BY COUNT(DISTINCT c.thesis_id) DESC, c.key ASC
    LIMIT GREATEST(LEAST(_limit, 50), 1)
  )
  -- Each group holds several spellings of the same work. Pick the most common
  -- one, and break ties by length: on a young corpus most works are cited only
  -- two or three times, each time formatted differently, so ties are the norm
  -- rather than the exception — and the longer string is the more complete
  -- attribution ("Bourdieu, P." over "Bourdieu"). The final alphabetical tier
  -- only exists to keep the result deterministic.
  SELECT
    btrim(
      (SELECT c.title FROM cited c WHERE c.key = r.key
       GROUP BY c.title ORDER BY COUNT(*) DESC, length(c.title) DESC, c.title ASC LIMIT 1),
      ' .,;:'
    ) AS title,
    (SELECT c.authors FROM cited c WHERE c.key = r.key AND c.authors IS NOT NULL
     GROUP BY c.authors ORDER BY COUNT(*) DESC, length(c.authors) DESC, c.authors ASC LIMIT 1) AS authors,
    (SELECT c.year FROM cited c WHERE c.key = r.key AND c.year IS NOT NULL
     GROUP BY c.year ORDER BY COUNT(*) DESC, c.year ASC LIMIT 1) AS year,
    r.thesis_count,
    (SELECT c.raw_citation FROM cited c WHERE c.key = r.key
     ORDER BY length(c.raw_citation) DESC LIMIT 1) AS sample_citation
  FROM ranked r
  ORDER BY r.thesis_count DESC, title ASC;
$$;
