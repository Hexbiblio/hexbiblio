-- ============================================================
-- Admin role + moderation dashboard support
-- ============================================================

-- 1. Roles table ---------------------------------------------------------
-- Deliberately NOT a profiles.role/is_admin column: that would be a
-- client-writable column governed only by RLS, the exact bug class already
-- fixed once for theses.author_name. A separate table with zero write
-- policies for `authenticated` means privilege escalation isn't just
-- "hope RLS is right" — there is no authenticated write path at all.
-- Granting/revoking admin only happens via service_role or direct SQL.
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users may read their own role assignment (needed so the frontend can ask
-- "am I an admin?"). No INSERT/UPDATE/DELETE policy is created here.
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2. is_admin() helper -----------------------------------------------------
-- SECURITY DEFINER + STABLE: the standard Supabase-recommended pattern so
-- other tables' RLS policies can call is_admin(auth.uid()) without risking
-- RLS self-recursion when evaluated from within another policy.
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- 3. Make the immutable-fields trigger admin-aware --------------------------
-- Same trigger, same columns, same BEFORE UPDATE firing (defined in
-- 20260730160000_allow_thesis_metadata_edits.sql) — only the function body
-- changes, so CREATE OR REPLACE is enough; no need to recreate the trigger.
CREATE OR REPLACE FUNCTION public.lock_immutable_thesis_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  NEW.title := OLD.title;
  NEW.abstract := OLD.abstract;
  NEW.file_url := OLD.file_url;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

-- 4. New permissive RLS policies on theses ----------------------------------
-- Postgres ORs multiple permissive policies for the same command together,
-- so these are additive to (not replacements for) the existing owner-only
-- "Users can update own theses" / "Users can delete own theses" policies.
-- No admin INSERT policy is added — theses stay server-only-insertable via
-- the submit-thesis edge function's AI content-verification gate.
CREATE POLICY "Admins can update any thesis"
ON public.theses FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any thesis"
ON public.theses FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- 5. New permissive RLS policy on profiles ----------------------------------
-- Lets an admin edit another user's profile fields from the moderation
-- dashboard. No admin DELETE policy is added: profile rows are only ever
-- removed via the existing auth.users CASCADE, which account deletion
-- (via the admin-delete-user edge function's Auth Admin API call) already
-- triggers — service_role bypasses RLS regardless.
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));
