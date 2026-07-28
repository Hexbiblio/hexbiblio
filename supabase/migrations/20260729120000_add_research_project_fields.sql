-- Fields captured automatically as the user completes thesis quests in the chatbot.
-- "discipline" reuses the existing profiles.field_of_study column.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS research_theme TEXT,
  ADD COLUMN IF NOT EXISTS research_question TEXT,
  ADD COLUMN IF NOT EXISTS thesis_statement TEXT,
  ADD COLUMN IF NOT EXISTS methodology TEXT,
  ADD COLUMN IF NOT EXISTS research_sources TEXT;
