-- Authors can now edit a few metadata fields on their own thesis after
-- submission (field, degree_type, graduation_year, keywords) — the existing
-- "Users can update own theses" RLS policy already permits this (it was
-- never column-restricted), but nothing stopped that same policy from also
-- allowing a direct API call to change title/abstract/file_url/author, which
-- are supposed to stay exactly what was verified at submission time. Lock
-- those specific columns at the trigger level instead of trusting the
-- client (or a future UI) to never send them — nothing in this codebase
-- ever legitimately updates them post-insert.
CREATE OR REPLACE FUNCTION public.lock_immutable_thesis_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.title := OLD.title;
  NEW.abstract := OLD.abstract;
  NEW.file_url := OLD.file_url;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lock_immutable_thesis_fields_trigger ON public.theses;
CREATE TRIGGER lock_immutable_thesis_fields_trigger
  BEFORE UPDATE ON public.theses
  FOR EACH ROW EXECUTE FUNCTION public.lock_immutable_thesis_fields();
