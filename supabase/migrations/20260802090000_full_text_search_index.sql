-- ============================================================
-- PERF-04: indexed, accent-insensitive full-text search
-- ============================================================
-- `/database` and `/sources` searched via `ILIKE '%term%'`: no index can
-- serve a leading wildcard, so every keystroke scanned the whole table, and
-- it was accent-sensitive ("memoire" never matched "mémoire"). This adds a
-- GIN-indexed tsvector per table, searched via websearch_to_tsquery from the
-- client (see searchFilter.ts's foldAccents + the updated page queries).

-- 1. Accent folding ---------------------------------------------------------
-- Same translate()-based mapping as normalize_citation_title() (field
-- essentials migration) and for the same reason: translate() is genuinely
-- IMMUTABLE, so it can back a trigger-maintained column without the usual
-- "wrap unaccent() and pretend it's immutable" workaround, and needs no
-- extension. Generalized here (no punctuation stripping — to_tsvector's own
-- tokenizer handles that) rather than reusing normalize_citation_title()
-- itself, which is shaped specifically for citation-title grouping.
CREATE OR REPLACE FUNCTION public.unaccent_immutable(_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT translate(
    lower(coalesce(_text, '')),
    'áàâäãåéèêëíìîïóòôöõøúùûüçñ',
    'aaaaaaeeeeiiiioooooouuuucn'
  );
$$;

-- 2. `theses` -----------------------------------------------------------
-- A trigger, not a generated column: to_tsvector(regconfig, text) is STABLE,
-- not IMMUTABLE (a text search configuration can in principle be altered),
-- so Postgres refuses it in a generated-column expression. A
-- BEFORE INSERT OR UPDATE trigger has no such restriction and is the
-- standard pattern for this.
ALTER TABLE public.theses ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.theses_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', public.unaccent_immutable(NEW.title)), 'A') ||
    setweight(to_tsvector('french', public.unaccent_immutable(NEW.author_name)), 'B') ||
    setweight(to_tsvector('french', public.unaccent_immutable(array_to_string(coalesce(NEW.keywords, '{}'), ' '))), 'B') ||
    setweight(to_tsvector('french', public.unaccent_immutable(NEW.abstract)), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS theses_search_vector_trigger ON public.theses;
-- Name sorts after lock_immutable_thesis_fields_trigger and
-- set_thesis_author_name_trigger (Postgres fires same-event BEFORE triggers
-- in name order) so this always sees the final, trigger-corrected
-- author_name/title/abstract — never a value a spoofed request tried to set.
CREATE TRIGGER theses_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.theses
FOR EACH ROW EXECUTE FUNCTION public.theses_search_vector_update();

-- Backfill: the trigger only covers writes from here on.
UPDATE public.theses SET search_vector =
  setweight(to_tsvector('french', public.unaccent_immutable(title)), 'A') ||
  setweight(to_tsvector('french', public.unaccent_immutable(author_name)), 'B') ||
  setweight(to_tsvector('french', public.unaccent_immutable(array_to_string(coalesce(keywords, '{}'), ' '))), 'B') ||
  setweight(to_tsvector('french', public.unaccent_immutable(abstract)), 'C');

CREATE INDEX IF NOT EXISTS theses_search_vector_idx ON public.theses USING GIN (search_vector);

-- 3. `sources` ------------------------------------------------------------
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.sources_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', public.unaccent_immutable(NEW.title)), 'A') ||
    setweight(to_tsvector('french', public.unaccent_immutable(NEW.authors)), 'B') ||
    setweight(to_tsvector('french', public.unaccent_immutable(NEW.raw_citation)), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sources_search_vector_trigger ON public.sources;
CREATE TRIGGER sources_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.sources
FOR EACH ROW EXECUTE FUNCTION public.sources_search_vector_update();

UPDATE public.sources SET search_vector =
  setweight(to_tsvector('french', public.unaccent_immutable(title)), 'A') ||
  setweight(to_tsvector('french', public.unaccent_immutable(authors)), 'B') ||
  setweight(to_tsvector('french', public.unaccent_immutable(raw_citation)), 'C');

CREATE INDEX IF NOT EXISTS sources_search_vector_idx ON public.sources USING GIN (search_vector);
