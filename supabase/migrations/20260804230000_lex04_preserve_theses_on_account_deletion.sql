-- ============================================================
-- LEX-04: a deleted account should not take its theses down with it
-- ============================================================
-- Decision (2026-08-04): self-service account deletion is landing (see the
-- new delete-own-account edge function), and the existing
-- admin-delete-user already deletes accounts via the Auth Admin API. Both
-- rely on theses.user_id's foreign key to auth.users(id), which was
-- ON DELETE CASCADE from day one — meaning deleting an account also
-- silently deleted every thesis that student had submitted, and with it
-- (via theses.id's own cascades) its extracted sources and any
-- mémoires-proches links other theses had into it. Explicit product
-- decision: a deposited thesis is part of the corpus, not the account's
-- personal data — it survives account deletion.
--
-- author_name is unaffected either way: it's a plain column re-derived
-- from the submitter's profile at submission time (set_thesis_author_name
-- trigger), not a live join to profiles, so it stays exactly as it was
-- once the account and profile are gone.
--
-- The FK's actual constraint name isn't hardcoded here — it was never
-- explicitly named when the column was declared (20260413224509), so
-- Postgres auto-generated it, and re-deriving it from the catalog is more
-- reliable than guessing.
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'theses'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.theses DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

ALTER TABLE public.theses ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.theses
  ADD CONSTRAINT theses_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
