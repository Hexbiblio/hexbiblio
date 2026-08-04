-- ============================================================
-- SEO-02: masked public view of theses for anonymous browsing
-- ============================================================
-- Decision (2026-08-02): /database and /database/:id become readable
-- without an account, so Google can actually index thesis content — today
-- "Theses are viewable by authenticated users" (20260413224509) means an
-- anonymous crawler sees nothing at all. What's public: author name, title,
-- abstract, submission date and graduation year, and field. What stays
-- behind login, becoming the sign-up incentive instead of a wall: the PDF
-- (file_url), the extracted bibliography (the sources table, and the
-- mémoires-proches feature built on it), comments, and ratings.
--
-- Deliberately a VIEW with an explicit column list, not a new RLS policy
-- granting anon SELECT on `theses` itself — a table-level policy would
-- expose every column (file_url included) to any direct API call, not just
-- the fields the app's UI happens to render. This view is owned by the
-- migration role (postgres), which bypasses its own RLS on `theses` — so
-- the view sees every row regardless of the `authenticated`-only SELECT
-- policy, but callers can only ever see the columns listed here.
-- security_invoker = false is the default, spelled out explicitly since the
-- whole design depends on it.
CREATE VIEW public.theses_public
WITH (security_invoker = false)
AS
SELECT id, title, author_name, abstract, field, graduation_year, created_at, search_vector
FROM public.theses;

-- search_vector is included so `.textSearch()` keeps working for anonymous
-- visitors on /database — it's a derived tsvector (stemmed lexemes), not
-- the raw title/abstract text, same as what's already exposed on the
-- authenticated `theses` resource via PERF-04's index.
GRANT SELECT ON public.theses_public TO anon, authenticated;
