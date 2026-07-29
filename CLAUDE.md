# Hexbiblio — Project Context

Academic thesis-sharing platform: submission, browsing, comments/ratings, an AI research-advisor chatbot, and personal collections. React + TypeScript + Vite frontend, Supabase backend (Postgres, Auth, Storage, Edge Functions).

## Current infrastructure (as of 2026-07-29)

- **Frontend hosting**: Vercel, auto-deploys from the `main` branch on GitHub (`Hexbiblio/hexbiblio`). Live at `https://www.hexbiblio.vercel.app`. No custom domain yet.
- **Backend**: Supabase project ref `lstlboldqghczcomgxvv` — this is the user's own project, fully independent. **Do not confuse with `xyfsajxypbjgtceoqbkh`**, an old Lovable Cloud-managed project that is no longer used and should be treated as decommissioned.
- **AI chatbot** (`supabase/functions/thesis-chat`): calls the **Lovable AI Gateway** (`https://ai.gateway.lovable.dev/v1/chat/completions`, OpenAI-compatible) using a `LOVABLE_API_KEY` secret set in Supabase, with model `google/gemini-3-flash-preview`. This has been true across the function's entire git history — an earlier version of this doc incorrectly described it as calling Google's Gemini endpoint directly with `GEMINI_API_KEY`; that was never actually the case in code. Note the model string isn't a `-latest` alias, so watch for deprecation the way `gemini-2.5-flash` was deprecated before.
- **Quest system** (`src/components/ThesisQuests.tsx`): a 6-step roadmap (discipline → theme → question → thesis → method → sources) tracked per-user in `localStorage` (not synced server-side beyond the profile fields each quest writes to, see `QUEST_PROFILE_FIELD`). `detectCompletedQuests` only ever checks the *next* open quest against the user's latest message — strictly sequential, a later-step cue can't skip ahead of an earlier open one. As of 2026-07-29, `thesis-chat` also receives `currentQuest`/`completedQuests` in the request body and is prompted to redirect the student back to the current step if their message jumps ahead, rather than just following the tangent.
- **Auth providers**: Email/password (native Supabase) and Google OAuth (native `supabase.auth.signInWithOAuth`, configured with the user's own Google Cloud OAuth client). Apple sign-in is **intentionally hidden** in `src/pages/Auth.tsx` (commented out) — the user doesn't have a paid Apple Developer account yet. Re-enabling it requires that account plus a Services ID / Team ID / Key ID setup in Supabase's Apple provider.
- **Local dev**: project lives at `/Users/simonlegall/Desktop/All Inside/HexBiblio/Code/hexbiblio` on the user's Mac. `.env` is gitignored — recreate locally with the project's real `VITE_SUPABASE_*` values if missing (ask the user, don't guess).

## History worth knowing

- The project was originally built and hosted entirely on **Lovable** (Lovable Cloud managed backend + `*.lovable.app` hosting + a proprietary `@lovable.dev/cloud-auth-js` OAuth wrapper). All of that has been fully migrated away:
  - Hosting moved to Vercel.
  - Database/auth/storage migrated from the Lovable-managed Supabase project to the user's own project (`lstlboldqghczcomgxvv`), via a `pg_dump`/`pg_restore` export-and-restore of the `public` schema, `auth.users`/`auth.identities`, and storage bucket configs. Real user accounts (passwords included) survived the migration intact.
  - The Lovable proprietary Google/Apple OAuth wrapper was replaced with native `supabase.auth.signInWithOAuth`.
  - Lovable Cloud has since been (or is about to be) fully disconnected in Lovable's own UI (Cloud → Advanced settings → Remove Lovable Cloud).
- A security audit was done and fixed:
  - `thesis-chat` previously had **no real auth check** (always sent the shared anon key, never the caller's session token) and **no server-side rate limiting** — only a client-side, trivially-bypassable guest limit. Fixed: the function now verifies the caller's JWT via `supabase.auth.getUser()`, rate-limits by `user_id` (logged in) or `guest:<ip>` (anonymous) using a `chat_logs` table, and re-fetches the caller's profile server-side instead of trusting a client-supplied `profile` field.
  - The `theses` storage bucket had no file-size/MIME restrictions and its upload policy let any authenticated user upload into any other user's folder. Fixed: capped at 20MB/PDF-only, upload policy now checks `auth.uid() = (storage.foldername(name))[1]`.
  - `.env` was previously committed to the GitHub repo. It's now gitignored (values there are the public/anon Supabase key, not high-severity, but still cleaned up).

## Conventions / gotchas for future work

- Supabase's web SQL Editor does **not** support `COPY ... FROM stdin` blocks (psql-only) — any raw SQL given to the user to paste there must use plain `INSERT INTO ... VALUES (...)` statements.
- Don't manually cast JSON-shaped text (`{"key": "value"}`) to `::text[]` just because it starts with `{` — that broke `auth.users.raw_app_meta_data`/`raw_user_meta_data` (jsonb) during the migration. Let Postgres coerce plain string literals to the target column type instead.
- `storage.buckets`/`storage.objects` have a `protect_delete` trigger — direct `DELETE` on them is blocked by Supabase; use `ON CONFLICT DO NOTHING` on insert instead of delete-then-reinsert patterns.
- The user is comfortable following precise step-by-step instructions (GitHub web UI, Supabase dashboard, Google Cloud Console) but had no prior local git/terminal experience — this local clone is their first. Keep terminal commands explicit and check in after each one rather than batching many steps.

## Known follow-ups not yet done

- No custom domain yet (still on `hexbiblio.vercel.app`) — needed to fix Google's OAuth consent screen showing the raw Supabase URL instead of "Hexbiblio", and would look more professional generally.
- Apple sign-in is disabled pending a paid Apple Developer account.
- `npm audit` reports 19 vulnerabilities (1 low, 3 moderate, 14 high, 1 critical) — not yet investigated; likely dev-dependency noise but should be checked, not assumed safe.
- Old exposed Google OAuth client secret (shared in chat, then rotated) — confirm the old one was actually deleted from Google Cloud Console, not just superseded.
- The 3 seeded test users from the migration were the user's own test accounts — may already be deleted via Supabase Dashboard → Authentication → Users by the time you read this.
