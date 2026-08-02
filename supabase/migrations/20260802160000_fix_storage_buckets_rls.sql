-- ============================================================
-- Fix: storage.buckets has RLS enabled with zero policies
-- ============================================================
-- User-reported 2026-08-02: PDF downloads failing with "Bucket not found"
-- (NoSuchBucket) even though `theses` exists in storage.buckets and its
-- files are intact. Root cause: `select relrowsecurity from pg_class where
-- relname = 'buckets' and relnamespace = 'storage'::regnamespace` returned
-- true, and `select * from pg_policies where schemaname = 'storage' and
-- tablename = 'buckets'` returned zero rows — RLS enabled, no policy at
-- all. Postgres's default with RLS on and no matching policy is deny-all,
-- so the Storage API can't even see the bucket row to serve files from it.
--
-- No migration in this repo's history ever ran
-- `ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY` — Supabase does
-- not enable this by default (the real access-control layer is
-- storage.objects, already correctly policied per-bucket, e.g. "Thesis
-- PDFs are publicly accessible" on the `theses` bucket). This was almost
-- certainly toggled by hand in the Supabase dashboard or SQL Editor at some
-- point, without realizing it needed a policy to go with it.
--
-- Fix: bucket *metadata* (id/name/public flag/size limits) isn't sensitive —
-- add back a plain read policy, matching Supabase's own default posture.
-- Deliberately SELECT-only: no INSERT/UPDATE/DELETE policy, so creating or
-- deleting buckets themselves stays locked to the dashboard/service-role,
-- same "no policy = no access" pattern already used elsewhere in this
-- project (e.g. user_roles has zero write policies for authenticated).
CREATE POLICY "Buckets are viewable by everyone"
ON storage.buckets FOR SELECT
USING (true);
