-- ============================================================
-- "Signalement par les étudiants" — a report queue feeding the admin dashboard
-- ============================================================
-- Students can flag a thesis or a comment (never both at once); admins see
-- and triage the queue from a new tab in AdminDashboard.tsx. Closes the loop
-- with the moderation dashboard added 2026-07-31, which until now had no way
-- for anything to actually land in it besides an admin browsing manually.

CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thesis_id UUID REFERENCES public.theses(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(thesis_id, comment_id) = 1)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports"
ON public.reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- A reporter can see their own past reports (so the UI can grey out "already
-- reported" without a separate admin-only round trip); admins see everyone's.
CREATE POLICY "Reporters see their own reports, admins see all"
ON public.reports FOR SELECT TO authenticated
USING (auth.uid() = reporter_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reports"
ON public.reports FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- A plain UNIQUE(reporter_id, thesis_id, comment_id) would NOT actually
-- de-duplicate: SQL treats every NULL as distinct from every other NULL, so
-- two thesis-reports (both with comment_id NULL) would still be considered
-- different rows. Partial indexes, scoped to exactly the rows where the
-- other target column is NULL, are what actually enforces "one report per
-- user per thesis" and "one report per user per comment" separately.
CREATE UNIQUE INDEX reports_unique_thesis_report ON public.reports (reporter_id, thesis_id) WHERE comment_id IS NULL;
CREATE UNIQUE INDEX reports_unique_comment_report ON public.reports (reporter_id, comment_id) WHERE thesis_id IS NULL;

CREATE INDEX idx_reports_status ON public.reports(status);
