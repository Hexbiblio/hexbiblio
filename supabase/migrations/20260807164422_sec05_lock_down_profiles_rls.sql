-- ============================================================
-- SEC-05: profiles was readable end-to-end by any authenticated user
-- ============================================================
-- "Profiles are viewable by authenticated users" (20260413224509) was
-- USING (true) — written back when profiles only held username/avatar_url,
-- but the table has since grown research_theme, research_question,
-- thesis_statement, methodology, research_sources, writing_plan, bio,
-- academic_level, country, university and field_of_study (the quest
-- system's and onboarding card's per-student research data, see CLAUDE.md).
-- Any logged-in account could read any other student's in-progress thesis
-- topic and personal profile fields via a direct `select * from profiles`,
-- not just what the UI happens to render.
--
-- Fix: profiles is now readable only by its own owner (plus admins, who
-- already have this via the Comptes tab and report-author lookups). A
-- narrow `profiles_public` view — same masked-view pattern as SEO-02's
-- `theses_public` — exposes just (user_id, username) for the two
-- legitimate other-user lookups in the app: comment authorship
-- (CommentSection.tsx) and notification actor names (NotificationBell.tsx).
-- Both only ever displayed username for other users anyway, never the
-- research fields, so this is a pure tightening with no behavior change
-- for either of those two call sites.

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view any profile"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Owned by the migration role, so it bypasses profiles' own RLS the same
-- way theses_public bypasses theses' RLS — callers only ever get the two
-- columns listed here, never the research/personal fields.
CREATE VIEW public.profiles_public
WITH (security_invoker = false)
AS
SELECT user_id, username
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;
