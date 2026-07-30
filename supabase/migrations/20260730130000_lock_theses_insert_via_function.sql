-- Phase 2: the "submit-thesis" edge function is now the only path that may
-- create a thesis row (it runs the Gemini content-consistency check before
-- inserting, using the service_role key, which bypasses RLS). Remove the
-- policy that let authenticated clients insert directly, so the AI gate
-- can't be skipped by calling the API directly.
--
-- No replacement INSERT policy is added: service_role bypasses RLS entirely,
-- so the edge function's inserts are unaffected. SELECT/UPDATE/DELETE
-- policies on public.theses are untouched.
DROP POLICY IF EXISTS "Users can insert own theses" ON public.theses;
