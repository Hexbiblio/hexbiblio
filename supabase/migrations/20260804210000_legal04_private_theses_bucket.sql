-- ============================================================
-- LEGAL-04: PDFs were downloadable without an account if the URL leaked
-- ============================================================
-- SEO-02 (2026-08-02) put a "create an account to continue" wall around
-- the PDF download on ThesisDetail.tsx, but that wall was UI-only: the
-- "theses" bucket was public and every thesis's file_url was a permanent
-- public URL (https://.../storage/v1/object/public/theses/<path>). Anyone
-- who obtained that URL — a shared link, browser history, a search-engine
-- cache — could download the PDF directly, no session required, completely
-- bypassing the sign-up gate the UI implies exists.
--
-- Fix: make the bucket private and drop the anon-open SELECT policy,
-- leaving only "Thesis PDFs are accessible by authenticated users"
-- (20260413224521, TO authenticated) as the read path. The client now
-- fetches PDFs via supabase-js's authenticated download() call instead of
-- a plain <a href> to a public URL — see ThesisDetail.tsx.
--
-- Deliberately not touched: the upload/update/delete policies already
-- correctly scope writes to the caller's own folder
-- (auth.uid()::text = (storage.foldername(name))[1]) — this migration is
-- read-path only.
UPDATE storage.buckets SET public = false WHERE id = 'theses';

DROP POLICY IF EXISTS "Thesis PDFs are publicly accessible" ON storage.objects;
