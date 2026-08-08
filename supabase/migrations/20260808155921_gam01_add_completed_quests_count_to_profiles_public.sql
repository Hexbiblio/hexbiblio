-- ============================================================
-- GAM-01: expose a safe aggregate quest-completion count publicly
-- ============================================================
-- Gamification: student researcher titles/badges become visible to other
-- students (comments, notifications), per explicit product decision. SEC-05
-- (20260807164422) locked profiles_public down to (user_id, username) only,
-- specifically to stop exposing raw research-field content to other users —
-- this widening must never regress that. completed_quests_count is a plain
-- 0-7 integer (how many of the 7 quest-backing columns are non-empty), never
-- the field values themselves.
--
-- CREATE OR REPLACE VIEW is sufficient here (no DROP VIEW needed): existing
-- columns keep their name/order/type, and completed_quests_count is only
-- appended at the end — Postgres allows that for a plain view.
--
-- The "<> ''" check (not just IS NOT NULL) mirrors deriveCompleted()'s own
-- truthiness test in ThesisQuests.tsx, which treats an empty string as "not
-- done" the same way it treats NULL — so this count never disagrees with
-- what the student's own quest checklist already shows.
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = false)
AS
SELECT
  user_id,
  username,
  (
    (field_of_study    IS NOT NULL AND field_of_study    <> '')::int +
    (research_theme    IS NOT NULL AND research_theme    <> '')::int +
    (research_question IS NOT NULL AND research_question <> '')::int +
    (thesis_statement  IS NOT NULL AND thesis_statement  <> '')::int +
    (methodology       IS NOT NULL AND methodology       <> '')::int +
    (research_sources  IS NOT NULL AND research_sources  <> '')::int +
    (writing_plan      IS NOT NULL AND writing_plan      <> '')::int
  ) AS completed_quests_count
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;
