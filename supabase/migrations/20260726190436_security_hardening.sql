-- ============================================================
-- Security hardening migration
-- ============================================================

-- 1. Rate-limit log for the thesis-chat edge function.
-- Written only by the edge function via the service role key,
-- so RLS stays enabled with no public policies (default deny-all).
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- user_id (uuid as text) for logged-in users, or "guest:<ip>" for anonymous callers
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_chat_logs_identifier_created_at ON public.chat_logs (identifier, created_at);

-- Auto-cleanup helper (optional to schedule): removes entries older than 2 days.
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_logs()
RETURNS void AS $$
  DELETE FROM public.chat_logs WHERE created_at < now() - interval '2 days';
$$ LANGUAGE sql SET search_path = public;

-- 2. Tighten the "theses" storage bucket: restrict to PDFs, cap file size at 20MB.
UPDATE storage.buckets
SET file_size_limit = 20971520, -- 20 MB
    allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'theses';

-- 3. Fix the upload policy: users could previously upload into ANY folder
-- in the "theses" bucket, not just their own. Restrict inserts to the
-- caller's own folder, matching the existing update/delete policies.
DROP POLICY IF EXISTS "Authenticated users can upload thesis PDFs" ON storage.objects;

CREATE POLICY "Users can upload thesis PDFs to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'theses'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
