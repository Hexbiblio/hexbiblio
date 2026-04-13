ALTER TABLE public.theses
  ADD COLUMN keywords TEXT[] DEFAULT '{}',
  ADD COLUMN degree_type TEXT,
  ADD COLUMN graduation_year INTEGER;

-- Create a separate accuracy_ratings table for precision/usefulness votes
CREATE TABLE public.accuracy_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (thesis_id, user_id)
);

ALTER TABLE public.accuracy_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accuracy ratings viewable by authenticated users" ON public.accuracy_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own accuracy ratings" ON public.accuracy_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accuracy ratings" ON public.accuracy_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Function to get average accuracy score
CREATE OR REPLACE FUNCTION public.get_thesis_accuracy(thesis_uuid UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(score)::NUMERIC(3,2), 0) FROM public.accuracy_ratings WHERE thesis_id = thesis_uuid;
$$ LANGUAGE sql STABLE SET search_path = public;

-- Index on keywords for faster search
CREATE INDEX idx_theses_keywords ON public.theses USING GIN(keywords);