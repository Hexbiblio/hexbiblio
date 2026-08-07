-- ============================================================
-- Pilot: a 7th quest, "plan de rédaction" (writing plan) — self-report only
-- ============================================================
-- First step of the roadmap past "sources" (see competitive-analysis
-- artifact, differentiation piste 1). Deliberately a pilot, not the full
-- writing-process roadmap: unlike the first 6 quests, "have you outlined
-- your chapters" isn't something a single chat message can reliably confirm
-- the way "I argue that X" confirms a thesis statement — a writing plan
-- takes shape over days, not one exchange. So this quest is self-report
-- only, filled in directly on Profile.tsx (see ThesisQuests.tsx: it has no
-- USER_CUES entry, so thesis-chat never tries to auto-detect it), which
-- validates that mechanism before committing to more post-sources steps
-- built the same way.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS writing_plan TEXT;
