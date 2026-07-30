-- Phase 3: bibliography extraction. Each row is one citation pulled from a
-- thesis's PDF, browsable independently of the theses database (filtered by
-- the parent thesis's field/degree via a join, not duplicated columns).
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
  raw_citation TEXT NOT NULL,
  title TEXT,
  authors TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sources are viewable by authenticated users"
ON public.sources FOR SELECT TO authenticated USING (true);

-- No INSERT/UPDATE/DELETE policy for authenticated — only service_role
-- (the submit-thesis and extract-sources edge functions) can write, same
-- "server is the only writer" pattern as the Phase 2 theses lock.

CREATE INDEX idx_sources_thesis_id ON public.sources(thesis_id);
